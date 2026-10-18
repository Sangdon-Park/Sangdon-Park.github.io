$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$source = Get-Content -LiteralPath (Join-Path $root 'algorithm-preview/sources.json') -Raw -Encoding utf8 | ConvertFrom-Json
$html = Get-Content -LiteralPath (Join-Path $root 'algorithm-preview/index.html') -Raw -Encoding utf8
$plain = [Net.WebUtility]::HtmlDecode(($html -replace '<[^>]+>', ' '))
function Flat([string]$text) { return [regex]::Replace($text, '\s', '') }
if ($source.questions.Count -ne 5 -or $source.edition -ne 'rehearsal-20261018-ch1-4') { throw 'Wrong question count or edition' }
$chapters = @()
foreach ($question in $source.questions) {
  if ($question.chapter -lt 1 -or $question.chapter -gt 4) { throw 'Out-of-scope chapter' }
  $chapters += $question.chapter
  $file = Join-Path (Join-Path $root 'data/알고리즘') $question.file
  if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $question.sha256) { throw "Source changed: $($question.file)" }
  $archive = [IO.Compression.ZipFile]::OpenRead($file)
  try {
    function ReadXml([string]$part) {
      $reader = [IO.StreamReader]::new($archive.GetEntry($part).Open())
      try { [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    $slide = ReadXml ('ppt/slides/' + $question.part)
    $text = @($slide.SelectNodes("//*[local-name()='t']") | ForEach-Object InnerText) -join ' '
    if (!(Flat $text).Contains((Flat $question.quote))) { throw "PPTX quote mismatch: $($question.key)" }
    if (!(Flat $plain).Contains((Flat $question.quote))) { throw "HTML quote mismatch: $($question.key)" }
    foreach ($option in $question.options) {
      if (!(Flat $text).Contains((Flat $option)) -or !(Flat $plain).Contains((Flat $option))) { throw "Option mismatch: $option" }
    }
    $presentation = ReadXml 'ppt/presentation.xml'
    $rels = ReadXml 'ppt/_rels/presentation.xml.rels'
    $ordered = @($presentation.SelectNodes("//*[local-name()='sldId']"))
    $rid = $ordered[$question.slide - 1].GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $target = @($rels.SelectNodes("//*[local-name()='Relationship']") | Where-Object Id -EQ $rid)[0].Target
    if (!(($target -replace '^.*/', '') -eq $question.part)) { throw "Slide order mismatch: $($question.key)" }
    if ($slide.DocumentElement.GetAttribute('show') -eq '0') { throw 'Selected hidden slide' }
  } finally { $archive.Dispose() }
  Write-Output "Verified $($question.key): chapter $($question.chapter), question $($question.question), slide $($question.slide)"
}
if ((@($chapters | Sort-Object -Unique) -join ',') -ne '1,2,3,4') { throw 'Not all four chapters represented' }
if ($plain -match '회의실|count_above|pivot|그리디') { throw 'Retired question remains in visible content' }
Write-Output 'All five questions match the source PPTX files and 1-4 chapter scope.'
