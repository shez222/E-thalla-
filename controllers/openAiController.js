import { performance } from 'perf_hooks';
import fs from 'fs'
// import { sendPromptToGpt } from './openAI.js';

import OpenAI from "openai";



// // Endpoint to handle map analysis
// app.post('/generate-map', async (req, res) => {
//     try {
//         //   const { prompt, pdfPresent } = req.body;
//         const { prompt } = req.body;
//         //   const pdfPath = req.file.path || "";
//         //   const newFilePath = `${pdfPath}.pdf`
//         //   fs.renameSync(pdfPath, newFilePath);

//         console.log(`prompt: ${prompt}`)
//         const response = await sendPromptToGpt("thread_sf6tqTMg36DZ8zMRTFsRjvOc", prompt);
//         console.log("response: " + response)



//         res.json({ response: response });
//     } catch (error) {
//         console.error('Error processing: ', error.message);
//         res.status(500).json({ error: 'An error occurred while processing.' });
//     }
// });





var ASSISTANT_ID;
var openai;
var GPT_MODEL= "gpt-3.5-turbo"
var ASSISTANT_ID =  "asst_gsdgshhfdhdjJe6PCqovHC"
var OPENAI_API_KEY = "dfgjdaga0rY5tFlLs7JORSJdJ0NJlpBlDnwFCtVSTD3Oisf9SkzisT3BlbkFJPCDGXbt-9gLl974WC86v8YeVd5o8-N03gSntvU3XL5S0gWrOnC1QFqOTYu2pcWicOUTmc-pgEA"
export async function initializeOpenAI() {
    // ASSISTANT_ID = "asst_RkHMwBlQ2PkHY7Je6PCqovHC";
    ASSISTANT_ID = process.env.ASSISTANT_ID || ASSISTANT_ID;
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || OPENAI_API_KEY});
    console.log("Done open ai initialization: ", process.env.OPENAI_API_KEY || OPENAI_API_KEY)
}
// initializeOpenAI()  //uncomment this to connect with open ai
export async function createAssistant(name, instructions) {
    const assistant = await openai.beta.assistants.create({
        name: name,
        instructions: instructions,
        // tools: [{ type: "code_interpreter" }],
        model: process.env.GPT_MODEL || "gpt-3.5-turbo"
    });
    console.log("Creating a new assistant...", assistant);
    return assistant;
}

export async function createThread() {
    console.log('Creating a new thread...');
    const thread = await openai.beta.threads.create();
    return thread;
}

// export async function addMessageWithAattachment(threadId, message, pdfPath) {
//   console.log('Adding a new message with attachment to thread: ' + threadId);
//   // A user wants to attach a file to a specific message, let's upload it.
//   // const newFilePath = `${pdfPath}.pdf`
//   // fs.renameSync(pdfPath, newFilePath);

//   const uploadedPdf = await openai.files.create({
//     file: fs.createReadStream(pdfPath),
//     purpose: "assistants",
//   });
//   // fs.unlinkSync(newFilePath);

//   const response = await openai.beta.threads.messages.create(
//     threadId,
//     {
//       role: "user",
//       content: message,
//       // Attach the new file to the message.
//       attachments: [{ file_id: uploadedPdf.id, tools: [{ type: "file_search" }] }],
//     }
//   );
//   return response;
// }
export async function addMessage(threadId, message) {
    console.log('Adding a new message to thread: ' + threadId);
    // A user wants to attach a file to a specific message, let's upload it.
    const response = await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: message
        }
    );
    // console.log("Message: ",openai.beta.threads.messages.chat)
    // console.log(response)

    return response;
}

export async function runAssistant(threadId) {
    console.log("Using Assistant:" + ASSISTANT_ID);
    console.log('Running assistant for thread: ' + threadId);
    // const response = await openai.beta.threads.runs.create(
    //   threadId,
    //   {
    //     assistant_id: ASSISTANT_ID
    //     // Make sure to not overwrite the original instruction, unless you want to
    //   }
    // );
    const response = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: ASSISTANT_ID,
    });

    return response.id;
}

export async function checkingStatus(threadId, runId, addressCoordinates) {
    return new Promise((resolve, reject) => {
        let pollingInterval;
        let isChecking = false;

        const checkStatus = async () => {
            if (isChecking) {
                return;
            }

            isChecking = true;
            try {
                let runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
                const status = runObject.status;

                console.log("Checking status\n");
                console.log('Current status: ' + status);
                if (status === `failed`) {
                    // console.log(runObject)
                    const responseObject = {
                        message: "I have encountered some technical difficulty, can you please try again?",
                        // message: "Run failed",
                        conversation_ended: true,
                        requires_action: null,
                        error_message: runObject.last_error.message,
                        error_code: runObject.last_error.code
                    };

                    clearInterval(pollingInterval);
                    // Resolve with the stringified JSON object
                    resolve(JSON.stringify(responseObject));
                }
                if (status === 'completed') {
                    clearInterval(pollingInterval);

                    const messagesList = await openai.beta.threads.messages.list(threadId);
                    const lastMessage = messagesList.body.data[0].content[0].text.value;
                    resolve(lastMessage);
                } else if (status === 'requires_action') {
                    console.log('requires_action.. looking for a function');

                    if (runObject.required_action.type === 'submit_tool_outputs') {
                        console.log('submit tool outputs ... ');

                        const tool_calls = await runObject.required_action.submit_tool_outputs.tool_calls;
                        const startTime = performance.now();

                        await openai.beta.threads.runs.submitToolOutputs(
                            threadId,
                            runId,
                            {
                                tool_outputs: await processToolCalls(tool_calls, addressCoordinates)
                            }
                        );
                        const endTime = performance.now();
                        console.log(`Tool calls took: ${(endTime - startTime).toFixed(2)}ms`);
                    }
                }
            } catch (error) {
                console.error(`Error checking status:`, error);
                reject(error);
            } finally {
                isChecking = false;
            }
        };

        pollingInterval = setInterval(checkStatus, 500); // Reduce interval size as needed
    });
}


async function processToolCalls(toolCalls, addressCoordinates) {
    const toolOutputs = [];
    console.log("total tool_calls: ", toolCalls);

    for (const toolCall of toolCalls) {
        try {
            const parsedArgs = JSON.parse(toolCall.function.arguments);
            const functionName = toolCall.function.name;

            console.log(`Arguments for method calling: ${JSON.stringify(parsedArgs)}\n Method to be called: ${functionName}\n Function is: ${JSON.stringify(toolCall.function)}`);

            if (functionMap[functionName]) {
                // console.log("functionMap: ", functionMap);  

                // saved address need to be converted into coordinates for processing maps api
                // const startTime = performance.now();
                if ((functionName === 'getWeatherDetailsViaOpenWeatherApi' || functionName === 'searchAvailableReservationRestaurants') && parsedArgs.latitude === null && parsedArgs.longitude == null) {
                    // let answer = await sendPromptToGpt("thread_fgGGt10hJ5lUGmlPRjOfzEeE", "I am giving you an address, Just do the conversion to latiude and longitude and just return there values. Here is the address: " + addressCoordinates)
                    console.log("saved address coordinates: ", addressCoordinates)
                    // const [lat, long] = JSON.parse(addressCoordinates).message.split(",").map(Number);
                    const [lat, long] = addressCoordinates.split(",").map(Number);
                    // [parsedArgs.latitude, parsedArgs.longitude] = JSON.parse(answer).message.split(",").map(Number);
                    parsedArgs.latitude = lat;
                    parsedArgs.longitude = long;
                    console.log("lat ", parsedArgs.latitude, " long ", parsedArgs.longitude)
                    // console.log(parsedArgs.location)
                }
                else if ((functionName === 'getRestaurants' || functionName === 'getLocalBusiness') && parsedArgs.location === null) {
                    // let answer = await sendPromptToGpt("thread_fgGGt10hJ5lUGmlPRjOfzEeE", "I am giving you an address, Just do the conversion to latiude and longitude and just return there values. Here is the address: " + addressCoordinates)
                    console.log("saved address coordinates: ", addressCoordinates)
                    // parsedArgs.location = '@' + JSON.parse(addressCoordinates).message + ',21z'
                    parsedArgs.location = '@' + addressCoordinates + ',21z'
                    console.log(parsedArgs.location)
                }
                // const endTime = performance.now();
                // const duration = endTime - startTime;

                // console.log(`Function ${functionName} took ${duration.toFixed(2)} milliseconds`);

                // Measure the time taken for the function call 
                const startTime = performance.now();
                const apiResponse = await functionMap[functionName](parsedArgs);
                const endTime = performance.now();
                const duration = endTime - startTime;

                console.log(`Function ${functionName} took ${duration.toFixed(2)} milliseconds`);

                toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify(apiResponse)
                });

                // Log the duration separately
                console.log(`Duration for ${functionName}: ${duration.toFixed(2)} ms`);
            } else {
                console.error(`Function ${functionName} not found in function map`);
                toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: JSON.stringify({ error: `Function ${functionName} not found` })
                });
            }
        } catch (error) {
            console.error(`Error processing tool call ${toolCall.id}:`, error);
            toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ error: error.message })
            });
        }
    }
    console.log("Returning tool outputs: ", toolOutputs);

    return toolOutputs;
}



export async function sendPromptToGpt(threadId, prompt) {
    let startTime = performance.now();
    let message;

    console.log("sending msg to gpt")
    // return
    message = await addMessage(threadId, prompt);


    let endTime = performance.now();
    let duration = endTime - startTime;
    console.log(`\nFunction add message took ${duration.toFixed(2)} milliseconds`);


    let resBody;
    startTime = performance.now();
    // let runId = await runAssistant(threadId);
    let run = await runAssistant(threadId);
    endTime = performance.now();
    duration = endTime - startTime;
    console.log(`\nFunction run assistant took ${duration.toFixed(2)} milliseconds`);

    let messages;
    let finalmessage;
    // console.log(run)

    // if (run.status === 'completed') {
    
        messages = await openai.beta.threads.messages.list(threadId, {
            run_id: run,
        });
        // console.log(messages)

        finalmessage = messages.data.pop();
    // }

    // console.log("messages: ",finalmessage.content[0])
    startTime = performance.now();
    // resBody = await checkingStatus(threadId, runId);
    endTime = performance.now();
    duration = endTime - startTime;
    console.log(`\nFunction checking status took ${duration.toFixed(2)} milliseconds`);

    // if (JSON.parse(resBody).conversation_ended == true) {
    //   const ans = await getConversation(threadId)
    //   console.log("here we go",ans);


    //   console.log("here we go domain",JSON.parse(resBody).domain);
    //   const newTask = new task({
    //     domain: JSON.parse(resBody).domain || "Not Available",
    //     conversation: ans,
    //     user: userId,
    //   });

    //   newTask.save();


    // }
    // console.log(finalmessage)
    return finalmessage.content[0].text.value;
}

export async function getConversation(threadId) {
    const messagesResponse = await openai.beta.threads.messages.list(

        threadId

    );

    let conversation = [];
    let tempRequest = null;
    let tempResponse = null;

    messagesResponse.data.forEach(element => {
        var role = element.role;
        element.content.forEach(data => {
            if (role === 'user') {
                tempRequest = data.text.value;
            } else if (role === 'assistant') {
                try {
                    const parsedData = JSON.parse(data.text.value);
                    tempResponse = parsedData.message;
                } catch (error) {
                    console.error("Error parsing assistant message:", error);
                }
            }

            // If both request and response are available, add to the conversation array
            if (tempRequest && tempResponse) {
                conversation.push({
                    request: tempRequest,
                    response: tempResponse
                });

                // Reset temp variables for the next pair
                tempRequest = null;
                tempResponse = null;
            }
        });
    });

    // console.log(conversation);
    return conversation
} 

/*
You have to act as an architect. Taking information of the plot size, its length and width, no of rooms, toilets they want and also kitchen.
Now on the basis of this, you will have to give them response, and it would be in json so that it could be mapped to react svg. 

Give me json that can be mapped using react native svg of the houes sizes and rooms provided by the user ( all rooms etc should be fix in standard sq yards rectangular boundry )

Like this:

const houseData = {
    boundary: {
      width: 300,
      height: 450,
      scale: 300 / 30, // Scale based on width (30 feet)
    },
    rooms: [
      { name: "Car Porch", x: 0, y: 0, width: 10, height: 15 },
      { name: "Drawing Room", x: 10, y: 0, width: 20, height: 15 },
      { name: "Bedroom 1", x: 0, y: 15, width: 15, height: 15 },
      { name: "Bedroom 2", x: 15, y: 15, width: 15, height: 15 },
      { name: "Kitchen", x: 0, y: 30, width: 10, height: 15 },
      { name: "Bathroom", x: 10, y: 30, width: 10, height: 15 },
      { name: "Living Room", x: 20, y: 30, width: 10, height: 15 },
    ],
    doors: [
      { name: "Main Gate", x: 5, y: 0, width: 5 },
      { name: "Door to Drawing Room", x: 10, y: 15, width: 5 },
      { name: "Door to Bedroom 1", x: 7.5, y: 15, width: 5 },
      { name: "Door to Bedroom 2", x: 22.5, y: 15, width: 5 },
      { name: "Door to Bathroom", x: 15, y: 30, width: 4 },
      { name: "Door to Kitchen", x: 5, y: 30, width: 5 },
      { name: "Door to Living Room", x: 25, y: 30, width: 5 },
    ],
  };
*/