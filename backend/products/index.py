'''API для управления продуктовой матрицей и заявками на продукты'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise Exception('DATABASE_URL not found')
    return psycopg2.connect(dsn)

def handler(event: dict, context) -> dict:
    '''API для управления продуктовой матрицей и заявками на продукты'''
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
            if action == 'get_categories':
                return get_categories(event)
            elif action == 'get_products':
                return get_products(event)
            elif action == 'get_orders':
                return get_orders(event)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if action == 'create_category':
                return create_category(body)
            elif action == 'create_product':
                return create_product(body)
            elif action == 'create_order':
                return create_order(body)
            elif action == 'update_order_item':
                return update_order_item(body)
            elif action == 'update_order_status':
                return update_order_status(body)
            elif action == 'delete_category':
                return delete_category(body)
            elif action == 'delete_product':
                return delete_product(body)
            elif action == 'update_category':
                return update_category(body)
        
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

def get_categories(event: dict) -> dict:
    '''Получение категорий продуктов'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT * FROM product_categories WHERE restaurant_id = %s ORDER BY name",
        (restaurant_id,)
    )
    categories = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'categories': [dict(c) for c in categories]}, default=str),
        'isBase64Encoded': False
    }

def get_products(event: dict) -> dict:
    '''Получение продуктов'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT p.*, pc.name as category_name 
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        WHERE p.restaurant_id = %s
        ORDER BY pc.name, p.name
    """, (restaurant_id,))
    products = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'products': [dict(p) for p in products]}, default=str),
        'isBase64Encoded': False
    }

def get_orders(event: dict) -> dict:
    '''Получение заявок'''
    restaurant_id = event.get('queryStringParameters', {}).get('restaurantId')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT po.*, e.name as creator_name, e.role as creator_role
        FROM product_orders po
        JOIN employees e ON po.created_by = e.id
        WHERE po.restaurant_id = %s
        ORDER BY po.created_at DESC
    """, (restaurant_id,))
    orders = cur.fetchall()
    
    for order in orders:
        cur.execute("""
            SELECT poi.*, p.name as product_name, p.unit, pc.name as category_name
            FROM product_order_items poi
            JOIN products p ON poi.product_id = p.id
            JOIN product_categories pc ON p.category_id = pc.id
            WHERE poi.order_id = %s
            ORDER BY pc.name, p.name
        """, (order['id'],))
        order['items'] = [dict(item) for item in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'orders': [dict(o) for o in orders]}, default=str),
        'isBase64Encoded': False
    }

def create_category(body: dict) -> dict:
    '''Создание категории продуктов'''
    restaurant_id = body.get('restaurantId')
    name = body.get('name')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO product_categories (restaurant_id, name) VALUES (%s, %s) RETURNING *",
        (restaurant_id, name)
    )
    category = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'category': dict(category)}, default=str),
        'isBase64Encoded': False
    }

def create_product(body: dict) -> dict:
    '''Создание продукта'''
    restaurant_id = body.get('restaurantId')
    category_id = body.get('categoryId')
    name = body.get('name')
    unit = body.get('unit')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO products (restaurant_id, category_id, name, unit) VALUES (%s, %s, %s, %s) RETURNING *",
        (restaurant_id, category_id, name, unit)
    )
    product = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'product': dict(product)}, default=str),
        'isBase64Encoded': False
    }

def create_order(body: dict) -> dict:
    '''Создание заявки на продукты'''
    restaurant_id = body.get('restaurantId')
    created_by = body.get('createdBy')
    items = body.get('items', [])
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "INSERT INTO product_orders (restaurant_id, created_by, status) VALUES (%s, %s, 'pending') RETURNING *",
        (restaurant_id, created_by)
    )
    order = cur.fetchone()
    order_id = order['id']
    
    for item in items:
        cur.execute(
            "INSERT INTO product_order_items (order_id, product_id, status, notes) VALUES (%s, %s, %s, %s)",
            (order_id, item['productId'], item['status'], item.get('notes', ''))
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'order': dict(order)}, default=str),
        'isBase64Encoded': False
    }

def update_order_item(body: dict) -> dict:
    '''Обновление статуса позиции в заявке'''
    item_id = body.get('itemId')
    status = body.get('status')
    notes = body.get('notes', '')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE product_order_items SET status = %s, notes = %s WHERE id = %s",
        (status, notes, item_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def update_order_status(body: dict) -> dict:
    '''Обновление статуса заявки'''
    order_id = body.get('orderId')
    status = body.get('status')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE product_orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
        (status, order_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def delete_category(body: dict) -> dict:
    '''Удаление категории'''
    category_id = body.get('categoryId')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM products WHERE category_id = %s", (category_id,))
    cur.execute("DELETE FROM product_categories WHERE id = %s", (category_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def delete_product(body: dict) -> dict:
    '''Удаление продукта'''
    product_id = body.get('productId')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def update_category(body: dict) -> dict:
    '''Обновление названия категории'''
    category_id = body.get('categoryId')
    name = body.get('name')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "UPDATE product_categories SET name = %s WHERE id = %s",
        (name, category_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }