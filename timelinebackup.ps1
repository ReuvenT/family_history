# from vs code
# cd C:\Users\rtrab\OneDrive\Development\backups
# open the timelinebackup.ps1 file, and click the run button

$outputRoot = $PWD.Path + "\" #C:\Users\rtrab\OneDrive\Development\backups\"
$bkupFolder = $outputRoot + (Get-Date -Format "yyyy-MM") + "\"
$aggregateContent = ""
Write-Host "bkupFolder: " + $bkupFolder
$destinationZipPath = $bkupFolder + "tlbkup" + (Get-Date -Format "yyyy-MM-dd-hh") + ".zip" #Get-Date -Format "yyyy-MM-dd-hh"
Write-Host "destinationZipPath: " + $destinationZipPath

if (Test-Path -Path $bkupFolder -PathType Container) {}
else {
    New-Item -Path $outputRoot -Name (Get-Date -Format "yyyy-MM") -ItemType Directory
}

# Create the zip archive with this file
if (Test-Path $destinationZipPath) {
    Remove-Item $destinationZipPath -verbose
}

Compress-Archive -Path ".\timelinebackup.ps1" -DestinationPath $destinationZipPath -CompressionLevel Optimal
#New-Item -Path $destinationZipPath -ItemType file  # new empty zip file

$invalidChars = [regex]::escape([string][char[]][System.IO.Path]::GetInvalidFileNameChars())

$arrTimelines = @(
    "2139607/Carl-Trabin-Family"
    "2172652/Fannie-Trabin-Barnow-Family"
    "2141911/Harry-Trabin-Family"
    "2141156/Helene-Trabin-Berne-Family"
    "2141914/Ida-Trabin-Kilberg-Family"
    "2139216/Jacob-Trabin-Family"
    "2141915/Jenny-Trabin-Herlich-Family"
    "2141910/Philip-Trabin-Family"
    "2167412/Reuven-Trabin-Family"
    "2141912/Samuel-Trabin-Family"
    "2147311/Simon-Trabin-Family"
    "2165939/Sydney-Trabin-Family"
    "2138285/Trabin-Family"
)

# extract all the json
foreach ($timelineSegment in $arrTimelines) {
    $url = -join("https://www.tiki-toki.com/timeline/entry/", $timelineSegment, "/json/")
    Write-Output $url
    $outputFileName = $timelineSegment -replace "[$invalidChars]", "_"
    #$outputFileName = -join $outputRoot, $timelineSegment -replace "[$invalidChars]", "_",  ".json"

    $backupFilePath = ($bkupFolder + $outputFileName + ".json")
    Write-Output ($backupFilePath)
    $tlBackupJson = (Invoke-webrequest -URI $url).content
    $tlBackupJson | Out-File -FilePath ($backupFilePath)
    $aggregateContent += $tlBackupJson 

    $file = Get-Item $backupFilePath
    Write-Host ("output file: " + $backupFilePath + " size: " + $file.Length)

}

# save all the json in one file for searches, etc.
$aggregateFilePath = ($bkupFolder + "timelines-aggregate.json")
$aggregateContent | Out-File -FilePath ($aggregateFilePath)

# add all the json files to the Zip file and remove
$backupFilePath = ($bkupFolder + "*.json")
Compress-Archive -Path $backupFilePath -DestinationPath $destinationZipPath -Update
Remove-Item -Path $backupFilePath



