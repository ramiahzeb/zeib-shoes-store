$nodeBin = "C:\Users\Awan pc\AppData\Local\OpenAI\Codex\runtimes\cua_node\1b23c930bdf84ed6\bin"
$env:Path = "$nodeBin;$env:Path"
Set-Location "C:\Users\Awan pc\OneDrive\Documents\ZEIB SHOES STORE"
& "$nodeBin\npm.cmd" run dev -- --port 3000 *> "dev-server.combined.log"
