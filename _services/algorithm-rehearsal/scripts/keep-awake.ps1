param([Parameter(Mandatory=$true)][string]$Until)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System.Runtime.InteropServices;
public static class PracticeWorkerPower {
  [DllImport("kernel32.dll")]
  public static extern uint SetThreadExecutionState(uint flags);
}
'@
$taskDeadline = [DateTimeOffset]::Parse($Until)
try {
  [void][PracticeWorkerPower]::SetThreadExecutionState([uint32]2147483649)
  while ([DateTimeOffset]::UtcNow -lt $taskDeadline) { Start-Sleep -Seconds 30 }
} finally {
  [void][PracticeWorkerPower]::SetThreadExecutionState([uint32]2147483648)
}
