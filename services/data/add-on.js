import { getItem } from "@/services/external/dynamo/wrapper"

export const generateAddOnKey = (entityType = order, addOnName='signature_on_delivery') =>{
    return `ADDON#${entityType}#${addOnName.replace(/_/g, '').toLowerCase()}`
}

export const getAddOnById = async(addOnId) => {
    return await getItem(addOnId)
}