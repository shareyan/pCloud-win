candle Product.wxs FilesFragment.wxs myVerifyReadyDlg.wxs myWixUI_InstallDir.wxs  -dcodepage=1252
light -ext WixUIExtension -ext WixUtilExtension -cultures:zh-cn -loc zh-CN.wxl  Product.wixobj FilesFragment.wixobj myVerifyReadyDlg.wixobj myWixUI_InstallDir.wixobj -out WinFly.msi
pause
