import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

DSN = os.environ['DATABASE_URL']

def get_db_connection():
    return psycopg2.connect(DSN)

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event: dict, context) -> dict:
    '''API для управления инвентаризацией в ресторане'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    action = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        if action == 'get_active_inventory':
            return get_active_inventory(event)
        elif action == 'get_inventory_history':
            return get_inventory_history(event)
        elif action == 'create_inventory':
            return create_inventory(event)
        elif action == 'add_entry':
            return add_entry(event)
        elif action == 'complete_inventory':
            return complete_inventory(event)
        elif action == 'delete_inventory':
            return delete_inventory_func(event)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_active_inventory(event: dict) -> dict:
    '''Получить активную инвентаризацию ресторана'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, restaurant_id, name, date, responsible, status, created_at, completed_at
        FROM t_p93487342_chefassist_kitchen_m.inventories
        WHERE restaurant_id = %s AND status = 'in_progress'
        ORDER BY created_at DESC
        LIMIT 1
    """, (restaurant_id,))
    
    inventory = cur.fetchone()
    
    if inventory:
        cur.execute("""
            SELECT id, name, type, product_order
            FROM t_p93487342_chefassist_kitchen_m.inventory_products
            WHERE inventory_id = %s
            ORDER BY product_order, name
        """, (inventory['id'],))
        
        products = cur.fetchall()
        
        for product in products:
            cur.execute("""
                SELECT user_name, quantity, created_at
                FROM t_p93487342_chefassist_kitchen_m.inventory_entries
                WHERE inventory_product_id = %s
                ORDER BY created_at
            """, (product['id'],))
            
            product['entries'] = cur.fetchall()
        
        inventory['products'] = products
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'inventory': dict(inventory) if inventory else None}, default=str),
        'isBase64Encoded': False
    }

def get_inventory_history(event: dict) -> dict:
    '''Получить историю инвентаризаций ресторана'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, restaurant_id, name, date, responsible, status, created_at, completed_at
        FROM t_p93487342_chefassist_kitchen_m.inventories
        WHERE restaurant_id = %s AND status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 20
    """, (restaurant_id,))
    
    inventories = cur.fetchall()
    
    for inventory in inventories:
        cur.execute("""
            SELECT id, name, type, product_order
            FROM t_p93487342_chefassist_kitchen_m.inventory_products
            WHERE inventory_id = %s
            ORDER BY product_order, name
        """, (inventory['id'],))
        
        products = cur.fetchall()
        
        for product in products:
            cur.execute("""
                SELECT user_name, quantity, created_at
                FROM t_p93487342_chefassist_kitchen_m.inventory_entries
                WHERE inventory_product_id = %s
                ORDER BY created_at
            """, (product['id'],))
            
            product['entries'] = cur.fetchall()
        
        inventory['products'] = products
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'inventories': [dict(inv) for inv in inventories]}, default=str),
        'isBase64Encoded': False
    }

def create_inventory(event: dict) -> dict:
    '''Создать новую инвентаризацию'''
    body = json.loads(event.get('body', '{}'))
    restaurant_id = body.get('restaurantId')
    name = body.get('name')
    date = body.get('date')
    responsible = body.get('responsible')
    products = body.get('products', [])
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO t_p93487342_chefassist_kitchen_m.inventories 
        (restaurant_id, name, date, responsible, status)
        VALUES (%s, %s, %s, %s, 'in_progress')
        RETURNING id, restaurant_id, name, date, responsible, status, created_at
    """, (restaurant_id, name, date, responsible))
    
    inventory = cur.fetchone()
    
    for idx, product in enumerate(products):
        cur.execute("""
            INSERT INTO t_p93487342_chefassist_kitchen_m.inventory_products
            (inventory_id, name, type, product_order)
            VALUES (%s, %s, %s, %s)
        """, (inventory['id'], product['name'], product.get('type', 'product'), idx))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'inventory': dict(inventory)}, default=str),
        'isBase64Encoded': False
    }

def add_entry(event: dict) -> dict:
    '''Добавить запись о количестве продукта'''
    body = json.loads(event.get('body', '{}'))
    inventory_product_id = body.get('inventoryProductId')
    user_name = body.get('userName')
    quantity = body.get('quantity')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO t_p93487342_chefassist_kitchen_m.inventory_entries
        (inventory_product_id, user_name, quantity)
        VALUES (%s, %s, %s)
        RETURNING id, inventory_product_id, user_name, quantity, created_at
    """, (inventory_product_id, user_name, quantity))
    
    entry = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'entry': dict(entry)}, default=str),
        'isBase64Encoded': False
    }

def complete_inventory(event: dict) -> dict:
    '''Завершить инвентаризацию'''
    body = json.loads(event.get('body', '{}'))
    inventory_id = body.get('inventoryId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        UPDATE t_p93487342_chefassist_kitchen_m.inventories
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id, restaurant_id, name, date, responsible, status, completed_at
    """, (inventory_id,))
    
    inventory = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'inventory': dict(inventory)}, default=str),
        'isBase64Encoded': False
    }

def delete_inventory_func(event: dict) -> dict:
    '''Удалить инвентаризацию (только in_progress)'''
    body = json.loads(event.get('body', '{}'))
    inventory_id = body.get('inventoryId')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE t_p93487342_chefassist_kitchen_m.inventories
        SET status = 'cancelled'
        WHERE id = %s AND status = 'in_progress'
    """, (inventory_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
