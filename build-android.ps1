$env:JAVA_HOME="D:\BtSoft\jdk\jdk21"
$env:ANDROID_HOME="d:\1\1\AndroidSDK"
$env:GRADLE_USER_HOME="d:\1\1\.gradle"
$env:PATH="$env:ANDROID_HOME\platform-tools;$env:PATH"

cd d:\1\1\mslx-manager\android
.\gradlew.bat assembleDebug --stacktrace
