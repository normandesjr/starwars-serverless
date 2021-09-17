import { SQSEvent } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"

const dynamoDB = new DynamoDBClient({ })

interface FullCharacter {
  user: string,
  character: string,
  height: string,
  gender: string,
  swapi_id: string
}

export const main = async(event: SQSEvent) => {
  const body = JSON.parse(event.Records[0].body)

  const fullCharacter:FullCharacter = { 
    user: body.user, 
    character: body.character,
    height: body.height,
    gender: body.gender,
    swapi_id: body.swapi_id
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: fullCharacter.user },
      sk: { S: fullCharacter.character },
      height: { S: fullCharacter.height },
      gender: { S: fullCharacter.gender },
      swapi_id: { S: fullCharacter.swapi_id },
    }
  }

  await dynamoDB.send(new PutItemCommand(params))
  
}