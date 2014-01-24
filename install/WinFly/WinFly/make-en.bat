candle.exe Product.wxs FilesFragment.wxs myVerifyReadyDlg.wxs myWixUI_InstallDir.wxs  -dcodepage=1252
light.exe -ext WixUIExtension -ext WixUtilExtension -cultures:en-us -loc en-US.wxl  Product.wixobj FilesFragment.wixobj myVerifyReadyDlg.wixobj myWixUI_InstallDir.wixobj -out WinFly.msi
pause
