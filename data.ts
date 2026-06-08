
const chat = {
    "id": "chatcmpl-6ea30ecd-eda7-42fe-bcc2-dd59b7a79099",
    "object": "chat.completion",
    "created": 1780920029,
    "model": "llama-3.3-70b-versatile",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "tool_calls": [
                    {
                        "id": "q0vywtxcs",
                        "type": "function",
                        "function": {
                            "name": "getTime",
                            "arguments": "{\"format\":\"en-US\",\"includeSeconds\":true}"
                        }
                    }
                ]
            },
            "logprobs": null,
            "finish_reason": "tool_calls"
        }
    ],
    "usage": {
        "queue_time": 0.359735774,
        "prompt_tokens": 240,
        "prompt_time": 0.062747551,
        "completion_tokens": 20,
        "completion_time": 0.044546502,
        "total_tokens": 260,
        "total_time": 0.107294053
    },
    "usage_breakdown": null,
    "system_fingerprint": "fp_0761e44d7b",
    "x_groq": {
        "id": "req_01ktkhp3z1efdrxzrm0mcjzrg4",
        "seed": 1070803048
    },
    "service_tier": "on_demand"
}
