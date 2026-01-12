import json
import os
import random
import string
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей ресторанов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        if method == 'GET':
            if path == 'get_restaurant':
                return get_restaurant_info(event)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if path == 'create_restaurant':
                return create_restaurant(body)
            elif path == 'join_restaurant':
                return join_restaurant(body)
            elif path == 'login_existing':
                return login_existing_employee(body)
            elif path == 'get_employees':
                return get_employees(body)
            elif path == 'update_employee_role':
                return update_employee_role(body)
            elif path == 'remove_employee':
                return remove_employee(body)
            elif path == 'update_online_status':
                return update_online_status(body)
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_db_connection():
    '''Подключение к базе данных'''
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(db_url)


def generate_invite_code() -> str:
    '''Генерация уникального кода приглашения'''
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


def create_restaurant(body: dict) -> dict:
    '''Создание нового ресторана'''
    chef_name = body.get('chefName')
    restaurant_name = body.get('restaurantName')
    
    if not chef_name or not restaurant_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    invite_code = generate_invite_code()
    
    cur.execute(
        "INSERT INTO restaurants (name, created_by, invite_code) VALUES (%s, %s, %s) RETURNING id, name, created_by, invite_code, created_at",
        (restaurant_name, chef_name, invite_code)
    )
    restaurant = dict(cur.fetchone())
    
    cur.execute(
        "INSERT INTO employees (name, role, restaurant_id) VALUES (%s, %s, %s) RETURNING id, name, role, restaurant_id, joined_at",
        (chef_name, 'chef', restaurant['id'])
    )
    employee = dict(cur.fetchone())
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'restaurant': restaurant,
            'employee': employee
        }, default=str),
        'isBase64Encoded': False
    }


def join_restaurant(body: dict) -> dict:
    '''Присоединение сотрудника к ресторану'''
    name = body.get('name')
    role = body.get('role')
    invite_code = body.get('inviteCode')
    
    if not name or not role or not invite_code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM restaurants WHERE invite_code = %s", (invite_code,))
    restaurant = cur.fetchone()
    
    if not restaurant:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid invite code'}),
            'isBase64Encoded': False
        }
    
    restaurant = dict(restaurant)
    
    cur.execute(
        "SELECT * FROM employees WHERE restaurant_id = %s AND name = %s",
        (restaurant['id'], name)
    )
    existing_employee = cur.fetchone()
    
    if existing_employee:
        employee = dict(existing_employee)
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'restaurant': restaurant,
                'employee': employee,
                'isExisting': True
            }, default=str),
            'isBase64Encoded': False
        }
    
    cur.execute(
        "INSERT INTO employees (name, role, restaurant_id) VALUES (%s, %s, %s) RETURNING id, name, role, restaurant_id, joined_at",
        (name, role, restaurant['id'])
    )
    employee = dict(cur.fetchone())
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'restaurant': restaurant,
            'employee': employee,
            'isExisting': False
        }, default=str),
        'isBase64Encoded': False
    }


def login_existing_employee(body: dict) -> dict:
    '''Вход для существующего сотрудника'''
    name = body.get('name')
    invite_code = body.get('inviteCode')
    
    if not name or not invite_code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM restaurants WHERE invite_code = %s", (invite_code,))
    restaurant = cur.fetchone()
    
    if not restaurant:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid invite code'}),
            'isBase64Encoded': False
        }
    
    restaurant = dict(restaurant)
    
    cur.execute(
        "SELECT * FROM employees WHERE restaurant_id = %s AND name = %s",
        (restaurant['id'], name)
    )
    employee = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not employee:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Employee not found in this restaurant'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'restaurant': restaurant,
            'employee': dict(employee)
        }, default=str),
        'isBase64Encoded': False
    }


def get_restaurant_info(event: dict) -> dict:
    '''Получение информации о ресторане'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    if not restaurant_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing restaurantId'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM restaurants WHERE id = %s", (restaurant_id,))
    restaurant = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not restaurant:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Restaurant not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'restaurant': dict(restaurant)}, default=str),
        'isBase64Encoded': False
    }


def get_employees(body: dict) -> dict:
    '''Получение списка сотрудников ресторана'''
    restaurant_id = body.get('restaurantId')
    
    if not restaurant_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing restaurant_id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM employees WHERE restaurant_id = %s ORDER BY joined_at", (restaurant_id,))
    employees = [dict(row) for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'employees': employees}, default=str),
        'isBase64Encoded': False
    }


def update_employee_role(body: dict) -> dict:
    '''Обновление роли сотрудника'''
    employee_id = body.get('employeeId')
    new_role = body.get('newRole')
    
    if not employee_id or not new_role:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE employees SET role = %s WHERE id = %s RETURNING id, name, role, restaurant_id, joined_at",
        (new_role, employee_id)
    )
    employee = cur.fetchone()
    
    if not employee:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Employee not found'}),
            'isBase64Encoded': False
        }
    
    employee = dict(employee)
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'employee': employee}, default=str),
        'isBase64Encoded': False
    }


def remove_employee(body: dict) -> dict:
    '''Удаление сотрудника'''
    employee_id = body.get('employeeId')
    
    if not employee_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing employee_id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM employees WHERE id = %s", (employee_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }


def update_online_status(body: dict) -> dict:
    '''Обновление онлайн-статуса сотрудника'''
    employee_id = body.get('employeeId')
    is_online = body.get('isOnline', True)
    
    if not employee_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing employee_id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE employees SET is_online = %s, last_seen = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, is_online, last_seen",
        (is_online, employee_id)
    )
    employee = cur.fetchone()
    
    if not employee:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Employee not found'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'employee': dict(employee)}, default=str),
        'isBase64Encoded': False
    }