import { SQSEvent } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"

const dynamoDB = new DynamoDBClient({ })

// interface FullCharacter {
//   user: string,
//   character: string,
//   height: string,
//   gender: string,
//   swapi_id: string
// }

export const main = async(event: SQSEvent) => {  
  const record = JSON.parse(event.Records[0].body.replace(/\\/g, ''))
  
  const fullCharacter = { 
    user: record.user, 
    character: record.character,
    height: record.height,
    gender: record.gender,
    swapi_id: record.swapi_id
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