$env:JAVA_HOME = "D:\BtSoft\jdk\jdk21"
$env:ANDROID_HOME = "D:\1\1\AndroidSDK"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
Set-Location "D:\1\1\mslx-manager\android"
& ".\gradlew.bat" assembleDebug
