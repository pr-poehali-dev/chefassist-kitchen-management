import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с ТТК, чек-листами и инвентарем ресторана'''
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
    
    action = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        if method == 'GET':
            if action == 'get_ttk':
                return get_ttk(event)
            elif action == 'get_checklists':
                return get_checklists(event)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if action == 'create_ttk':
                return create_ttk(body)
            elif action == 'update_ttk':
                return update_ttk(body)
            elif action == 'delete_ttk':
                return delete_ttk(body)
            elif action == 'create_checklist':
                return create_checklist(body)
            elif action == 'update_checklist':
                return update_checklist(body)
            elif action == 'delete_checklist':
                return delete_checklist(body)
            elif action == 'update_checklist_item':
                return update_checklist_item(body)
        
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
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_ttk(event: dict) -> dict:
    '''Получение списка ТТК ресторана'''
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
    
    cur.execute(
        "SELECT * FROM ttk WHERE restaurant_id = %s ORDER BY created_at DESC",
        (restaurant_id,)
    )
    ttk_list = [dict(row) for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ttk': ttk_list}, default=str),
        'isBase64Encoded': False
    }


def create_ttk(body: dict) -> dict:
    '''Создание новой ТТК'''
    restaurant_id = body.get('restaurantId')
    name = body.get('name')
    category = body.get('category')
    output = body.get('output', 0)
    ingredients = body.get('ingredients')
    tech = body.get('tech', '')
    
    if not all([restaurant_id, name, category, ingredients]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO ttk (restaurant_id, name, category, output, ingredients, tech) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *",
        (restaurant_id, name, category, output, ingredients, tech)
    )
    ttk = dict(cur.fetchone())
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ttk': ttk}, default=str),
        'isBase64Encoded': False
    }


def update_ttk(body: dict) -> dict:
    '''Обновление ТТК'''
    ttk_id = body.get('id')
    name = body.get('name')
    category = body.get('category')
    output = body.get('output', 0)
    ingredients = body.get('ingredients')
    tech = body.get('tech', '')
    
    if not all([ttk_id, name, category, ingredients]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE ttk SET name = %s, category = %s, output = %s, ingredients = %s, tech = %s WHERE id = %s RETURNING *",
        (name, category, output, ingredients, tech, ttk_id)
    )
    ttk = cur.fetchone()
    
    if not ttk:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'TTK not found'}),
            'isBase64Encoded': False
        }
    
    ttk = dict(ttk)
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ttk': ttk}, default=str),
        'isBase64Encoded': False
    }


def delete_ttk(body: dict) -> dict:
    '''Удаление ТТК'''
    ttk_id = body.get('id')
    
    if not ttk_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM ttk WHERE id = %s", (ttk_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }


def get_checklists(event: dict) -> dict:
    '''Получение чек-листов с пунктами'''
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
    
    cur.execute(
        "SELECT * FROM checklists WHERE restaurant_id = %s ORDER BY created_at DESC",
        (restaurant_id,)
    )
    checklists = [dict(row) for row in cur.fetchall()]
    
    for checklist in checklists:
        cur.execute(
            "SELECT * FROM checklist_items WHERE checklist_id = %s ORDER BY item_order",
            (checklist['id'],)
        )
        checklist['items'] = [dict(row) for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'checklists': checklists}, default=str),
        'isBase64Encoded': False
    }


def create_checklist(body: dict) -> dict:
    '''Создание нового чек-листа'''
    restaurant_id = body.get('restaurantId')
    name = body.get('name')
    workshop = body.get('workshop')
    responsible = body.get('responsible')
    items = body.get('items', [])
    
    if not all([restaurant_id, name, workshop]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO checklists (restaurant_id, name, workshop, responsible) VALUES (%s, %s, %s, %s) RETURNING *",
        (restaurant_id, name, workshop, responsible)
    )
    checklist = dict(cur.fetchone())
    
    checklist_items = []
    for idx, item in enumerate(items):
        cur.execute(
            "INSERT INTO checklist_items (checklist_id, text, item_order) VALUES (%s, %s, %s) RETURNING *",
            (checklist['id'], item['text'], idx)
        )
        checklist_items.append(dict(cur.fetchone()))
    
    checklist['items'] = checklist_items
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'checklist': checklist}, default=str),
        'isBase64Encoded': False
    }


def update_checklist(body: dict) -> dict:
    '''Обновление чек-листа'''
    checklist_id = body.get('id')
    name = body.get('name')
    workshop = body.get('workshop')
    responsible = body.get('responsible')
    items = body.get('items', [])
    
    if not all([checklist_id, name, workshop]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE checklists SET name = %s, workshop = %s, responsible = %s WHERE id = %s RETURNING *",
        (name, workshop, responsible, checklist_id)
    )
    checklist = cur.fetchone()
    
    if not checklist:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Checklist not found'}),
            'isBase64Encoded': False
        }
    
    checklist = dict(checklist)
    
    cur.execute("DELETE FROM checklist_items WHERE checklist_id = %s", (checklist_id,))
    
    checklist_items = []
    for idx, item in enumerate(items):
        cur.execute(
            "INSERT INTO checklist_items (checklist_id, text, status, timestamp, item_order) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (checklist_id, item.get('text'), item.get('status', 'pending'), item.get('timestamp'), idx)
        )
        checklist_items.append(dict(cur.fetchone()))
    
    checklist['items'] = checklist_items
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'checklist': checklist}, default=str),
        'isBase64Encoded': False
    }


def delete_checklist(body: dict) -> dict:
    '''Удаление чек-листа'''
    checklist_id = body.get('id')
    
    if not checklist_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM checklist_items WHERE checklist_id = %s", (checklist_id,))
    cur.execute("DELETE FROM checklists WHERE id = %s", (checklist_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }


def update_checklist_item(body: dict) -> dict:
    '''Обновление статуса пункта чек-листа'''
    item_id = body.get('itemId')
    status = body.get('status')
    timestamp = body.get('timestamp')
    
    if not all([item_id, status]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "UPDATE checklist_items SET status = %s, timestamp = %s WHERE id = %s RETURNING *",
        (status, timestamp, item_id)
    )
    item = cur.fetchone()
    
    if not item:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Item not found'}),
            'isBase64Encoded': False
        }
    
    item = dict(item)
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'item': item}, default=str),
        'isBase64Encoded': False
    }
