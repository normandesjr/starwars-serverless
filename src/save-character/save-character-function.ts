
interface FullCharacter {
  user: string,
  character: string,
  height: string,
  gender: string,
  swapi_id: number
}

export const main = async(event: any) => {

  const fullCharacter:FullCharacter = { 
    user: event.detail.user,  
    character: event.detail.character,
    height: event.detail.height,
    gender: event.detail.gender,
    swapi_id: event.detail.swapi_id
  }

  return fullCharacter
}