Get-Content "$PSScriptRoot\.env" | ForEach-Object {
    if ($_ -match '^([^#][^=]*)=(.*)$') {
        Set-Item "env:$($matches[1].Trim())" $matches[2].Trim().Trim('"')
    }
}

$API_URL = "https://openrouter.ai/api/v1/chat/completions"
$OPENROUTER_SITE_URL = "http://localhost:3000"
$OPENROUTER_SITE_NAME = "My Example"

$NLP_MODEL = "google/gemma-4-31b-it:free"

$body = @"
    {
        "model": "$NLP_MODEL",
        "messages": [
            {
                "role":"user",
                "content":"Me conte uma curiosidade sobre LLMs"
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }
"@

curl.exe --silent -X POST "$API_URL" `
    -H "Content-Type: application/json" `
    -H "Authorization: Bearer $env:OPENROUTER_API_KEY" `
    -H "HTTP-Referer: $OPENROUTER_SITE_URL" `
    -H "X-Title: $OPENROUTER_SITE_NAME" `
    -d "$body" | jq
