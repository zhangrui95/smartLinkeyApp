!macro preInit
    ; This macro is inserted at the beginning of the NSIS .OnInit callback
    ; !system "echo ${INSTALL_REGISTRY_KEY} > ${BUILD_RESOURCES_DIR}/preInit"
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\HLK_SmartLinkey"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\HLK_SmartLinkey"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\HLK_SmartLinkey"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\HLK_SmartLinkey"
!macroend

