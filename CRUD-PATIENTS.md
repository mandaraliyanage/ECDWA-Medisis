# Patient CRUD Operations - AWS Setup

## Additional Lambda Functions for Patient Management

### 1. Create Patient (POST /patients)

**Lambda Function: `create-patient`**

```python
import json
import pymysql
import os
from datetime import datetime

# Environment variables
rds_host = os.environ['DB_HOST']
db_user = os.environ['DB_USER']
db_pass = os.environ['DB_PASS']
db_name = os.environ['DB_NAME']

def lambda_handler(event, context):
    try:
        # Parse request body
        if 'body' not in event or not event['body']:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'Request body is required'})
            }
        
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        
        patient_id = body['patient_id']
        name = body['name']
        age = body['age']
        gender = body['gender']
        medical_conditions = body.get('medical_conditions', '')
        
        # Connect to database
        conn = pymysql.connect(
            host=rds_host,
            user=db_user,
            password=db_pass,
            db=db_name,
            autocommit=True
        )
        
        # Check if patient already exists
        with conn.cursor() as cursor:
            cursor.execute("SELECT patient_id FROM patients WHERE patient_id = %s", (patient_id,))
            if cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({'error': 'Patient ID already exists'})
                }
        
        # Insert new patient
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO patients (patient_id, name, age, gender, medical_conditions) VALUES (%s, %s, %s, %s, %s)",
                (patient_id, name, age, gender, medical_conditions)
            )
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Patient created successfully',
                'patient_id': patient_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }
```

### 2. Update Patient (PUT /patients/{patient_id})

**Lambda Function: `update-patient`**

```python
import json
import pymysql
import os

# Environment variables
rds_host = os.environ['DB_HOST']
db_user = os.environ['DB_USER']
db_pass = os.environ['DB_PASS']
db_name = os.environ['DB_NAME']

def lambda_handler(event, context):
    try:
        # Get patient ID from path parameters
        patient_id = event['pathParameters']['patient_id']
        
        # Parse request body
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        
        name = body['name']
        age = body['age']
        gender = body['gender']
        medical_conditions = body.get('medical_conditions', '')
        
        # Connect to database
        conn = pymysql.connect(
            host=rds_host,
            user=db_user,
            password=db_pass,
            db=db_name,
            autocommit=True
        )
        
        # Check if patient exists
        with conn.cursor() as cursor:
            cursor.execute("SELECT patient_id FROM patients WHERE patient_id = %s", (patient_id,))
            if not cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'PUT, OPTIONS'
                    },
                    'body': json.dumps({'error': 'Patient not found'})
                }
        
        # Update patient
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE patients SET name = %s, age = %s, gender = %s, medical_conditions = %s WHERE patient_id = %s",
                (name, age, gender, medical_conditions, patient_id)
            )
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Patient updated successfully',
                'patient_id': patient_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }
```

### 3. Delete Patient (DELETE /patients/{patient_id})

**Lambda Function: `delete-patient`**

```python
import json
import pymysql
import os

# Environment variables
rds_host = os.environ['DB_HOST']
db_user = os.environ['DB_USER']
db_pass = os.environ['DB_PASS']
db_name = os.environ['DB_NAME']

def lambda_handler(event, context):
    try:
        # Get patient ID from path parameters
        patient_id = event['pathParameters']['patient_id']
        
        # Connect to database
        conn = pymysql.connect(
            host=rds_host,
            user=db_user,
            password=db_pass,
            db=db_name,
            autocommit=True
        )
        
        # Check if patient exists
        with conn.cursor() as cursor:
            cursor.execute("SELECT patient_id FROM patients WHERE patient_id = %s", (patient_id,))
            if not cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
                    },
                    'body': json.dumps({'error': 'Patient not found'})
                }
        
        # Delete related telemetry and alerts first (foreign key constraints)
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM alerts WHERE patient_id = %s", (patient_id,))
            cursor.execute("DELETE FROM telemetry WHERE patient_id = %s", (patient_id,))
            cursor.execute("DELETE FROM patients WHERE patient_id = %s", (patient_id,))
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Patient deleted successfully',
                'patient_id': patient_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }
```

## API Gateway Setup for CRUD

### Step-by-Step API Gateway Configuration:

#### 1. Add POST method to existing /patients resource:
1. Go to API Gateway Console
2. Select your `medisys-patient-api`
3. Click on `/patients` resource
4. Actions → Create Method → POST
5. Integration type: Lambda Function
6. Lambda Function: `create-patient`
7. Save
8. Actions → Enable CORS (allow POST)

#### 2. Create new resource for patient operations:
1. Click on `/patients` resource
2. Actions → Create Resource
3. Resource Name: `{patient_id}`
4. Resource Path: `{patient_id}`
5. Enable API Gateway CORS: ✓
6. Create Resource

#### 3. Add PUT method to /patients/{patient_id}:
1. Click on `/patients/{patient_id}` resource
2. Actions → Create Method → PUT
3. Integration type: Lambda Function
4. Lambda Function: `update-patient`
5. Save
6. Actions → Enable CORS (allow PUT)

#### 4. Add DELETE method to /patients/{patient_id}:
1. Click on `/patients/{patient_id}` resource
2. Actions → Create Method → DELETE
3. Integration type: Lambda Function
4. Lambda Function: `delete-patient`
5. Save
6. Actions → Enable CORS (allow DELETE)

#### 5. Deploy API:
1. Actions → Deploy API
2. Deployment stage: prod
3. Deploy

### IMPORTANT: Your API structure should look like this:
```
/
├── patients (GET, POST)
│   └── {patient_id} (PUT, DELETE)
├── alerts (GET)
├── telemetry (POST)
└── dashboard
    └── stats (GET)
```

### Verify endpoints work:
- GET: `https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients`
- POST: `https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients`
- PUT: `https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients/P001`
- DELETE: `https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients/P001`

## Environment Variables
Set these for all new Lambda functions:
- `DB_HOST`: Your RDS Aurora endpoint
- `DB_USER`: admin
- `DB_PASS`: Your RDS password
- `DB_NAME`: medisys

## Testing CRUD Operations

### Create Patient
```bash
curl -X POST https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P006",
    "name": "Test Patient",
    "age": 35,
    "gender": "Female",
    "medical_conditions": "None"
  }'
```

### Update Patient
```bash
curl -X PUT https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients/P006 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Patient",
    "age": 36,
    "gender": "Female",
    "medical_conditions": "Allergies"
  }'
```

### Delete Patient
```bash
curl -X DELETE https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/patients/P006
```

## URGENT: Fix CORS Error for Telemetry Endpoint

The telemetry form is getting CORS errors. Fix this in API Gateway:

### Fix CORS for /telemetry endpoint:

1. **Go to API Gateway Console**
2. **Select your API: `medisys-patient-api`**
3. **Click on `/telemetry` resource**
4. **Actions → Enable CORS**
5. **Configure CORS settings:**
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `GET,POST,OPTIONS`
6. **Click "Enable CORS and replace existing CORS headers"**
7. **Actions → Deploy API**
8. **Select Stage: prod**
9. **Deploy**

### Alternative: Check if OPTIONS method exists
1. Click on `/telemetry` resource
2. If you don't see an OPTIONS method, create one:
   - Actions → Create Method → OPTIONS
   - Integration type: Mock
   - Save
   - Enable CORS as above

### Test after fix:
```bash
# This should work after CORS fix:
curl -X POST https://zhn2q92n36.execute-api.eu-north-1.amazonaws.com/prod/telemetry \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "P001", "heart_rate": 45, "oxygen_level": 89}'
```

**The frontend is working correctly - this is just a backend CORS configuration issue.**

## Fix Lambda Function Body Parsing Error

If you get `{"error": "'body'"}` error, update your Lambda functions with better error handling:

### Updated Create Patient Lambda Function:
Replace your `create-patient` function with this improved version:

```python
import json
import pymysql
import os
from datetime import datetime

# Environment variables
rds_host = os.environ['DB_HOST']
db_user = os.environ['DB_USER']
db_pass = os.environ['DB_PASS']
db_name = os.environ['DB_NAME']

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Parse request body
        if 'body' not in event or not event['body']:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'Request body is required'})
            }
        
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        print(f"Parsed body: {json.dumps(body)}")
        
        # Validate required fields
        required_fields = ['patient_id', 'name', 'age', 'gender']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }
        
        patient_id = body['patient_id']
        name = body['name']
        age = body['age']
        gender = body['gender']
        medical_conditions = body.get('medical_conditions', '')
        
        # Connect to database
        conn = pymysql.connect(
            host=rds_host,
            user=db_user,
            password=db_pass,
            db=db_name,
            autocommit=True
        )
        
        # Check if patient already exists
        with conn.cursor() as cursor:
            cursor.execute("SELECT patient_id FROM patients WHERE patient_id = %s", (patient_id,))
            if cursor.fetchone():
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({'error': 'Patient ID already exists'})
                }
        
        # Insert new patient
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO patients (patient_id, name, age, gender, medical_conditions) VALUES (%s, %s, %s, %s, %s)",
                (patient_id, name, age, gender, medical_conditions)
            )
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Patient created successfully',
                'patient_id': patient_id
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }
```