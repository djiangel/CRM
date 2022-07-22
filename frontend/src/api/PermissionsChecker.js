
export function PermissionsChecker(groups,codeNames){
        return codeNames.every(
            codeName => !!groups.find(  
            group => group.permissions.find(
                permission => permission.codename === codeName
            )
            )
        )
    }




