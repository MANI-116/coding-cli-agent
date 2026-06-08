import axios  from "axios";
import { z } from "zod";

const URL ="https://api.groq.com/openai/v1/chat/completions";
const headers = {
    "Content-Type":"application/json",
    "Authorization":`Bearer ${process.env.GROK_API_KEY}`
}

// i will have tools --> name, execute, desc, argsvalidationSchema:zodSchema,argsSchema for sending to the model

interface Tool{
    name:string,
    execute:(args:any)=>Promise<unknown>,
    desc:string,
    argsValidationSchema:z.ZodTypeAny,
    giveToolInfo:()=>{
            name:string,
            description:string,
            parameters:any}

}

class GetTimeTool implements Tool{
    public name:string = "getTimeTool"
    public desc:string = "gives current time"

    constructor(){

    }
    async execute(args:{format:"en-US"|"en-GB",includeSeconds:boolean}){
        return new Date().toLocaleTimeString(args.format,{
            hour:"numeric",
            minute:"numeric",
            second:args.includeSeconds?"numeric":undefined
        });
    }

    public readonly argsValidationSchema = z.object({
        format:z.enum(["en-US","en-GB"]).describe("en-us yields  time in 12 hr format along with AM/PM like 3:32:56 PM "),
        includeSeconds:z.boolean().optional().default(true).describe("default set to true,if dont want seconds pass false")});
    giveToolInfo(){
         return {
            name:this.name,
            description:this.desc,
            parameters:z.toJSONSchema(this.argsValidationSchema)}
    }
    

}

const toolRegistry = new Map<string,Tool>();
const getTimeTool = new GetTimeTool();
toolRegistry.set(getTimeTool.name,getTimeTool);


const tools = Array.from(toolRegistry.entries()).map((entry)=>{ return { function:{...entry[1].giveToolInfo()}, type:"function"}})


async function agenticLoop(message:string){
    const messages:any = [];
    messages.push({role:"user",content:message});

  

    let tries = 20;

    while(tries--){

            const requestBody = {
                                    model:"llama-3.3-70b-versatile",
                                    messages,
                                    tools
                                    }
            const response = await axios.post(URL,requestBody,{headers});

            if(response.data.error){
                console.log("error occured-",response.data.error);
                return { error: response.data.error}
            }

            console.log(response.data.choices[0]);

            if(!response.data.choices[0]!.message.tool_calls){
                return response.data.choices[0]!.message.content;
            }

            messages.push(response.data.choices[0].message);
        
            for(const tool of response.data.choices[0]!.message.tool_calls){
        
                const {name:toolName,arguments:args} = tool.function;
        
                const toolInstance = toolRegistry.get(toolName);
                if(!toolInstance) throw new Error("tool not found");
        
            
                const parseData = toolInstance.argsValidationSchema.safeParse(JSON.parse(args));
                if(!parseData.success) throw new Error("validation failed");
                
        
                const response = await toolInstance.execute(parseData.data);
                messages.push({role:"tool",content:JSON.stringify(response),"tool_call_id":tool.id})
                
        
            }

    }

    throw new Error("Agent exceeded maximum iterations");
}


agenticLoop("give me the current time");