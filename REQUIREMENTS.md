## API Endpoints

#### Products

- **index**: '/products' [GET]
- **create** '/products/create/ [POST][token]: parameters required in body: {name, price, category} 
- **show** '/products/:id' [GET]
- **delete** '/products/:id' [DELETE]
- **update** '/products/:id' [PUT]: parameters required in body: {name, price, category}

#### Users

- **index**: '/users' [GET][token]
- **show**: '/users/:id' [GET][token]
- **create**: '/users' [POST]: parameters required in body: {username, firstname, lastname, password}

#### Orders
- **create**: '/order' [POST]: parameters required in body: {user_id, products} <br>
**Note:** products is an array of products in the shape: <br>
~~~~ js 
[
    {
        product_id: 1,
        quantity: 1
    },
    {
        product_id: 10,
        quantity: 2
    }
]
~~~~
#### To get orders by user:
`GET /user/:id/order` where id is user's id, and body should contain status and auth token should be passed.
**Note:** status is either 'active' or 'completed' to get current orders or finished orders, respectively.

## Data Shapes

#### Table: products

~~~~ sql
id SERIAL PRIMARY KEY,
name VARCHAR(200) NOT NULL,
price NUMERIC(7, 3) NOT NULL,
category VARCHAR(100)
~~~~

#### Table: Users

~~~~ sql 
id SERIAL PRIMARY KEY,
username VARCHAR(150) NOT NULL,
firstname VARCHAR(150) NOT NULL,
lastname VARCHAR(150) NOT NULL,
password_digest VARCHAR(250) NOT NULL
~~~~

#### Table: Orders
~~~~ sql 
id SERIAL PRIMARY KEY,
status VARCHAR(15),
user_id bigint REFERENCES users(id)
~~~~

#### Table: order_products

~~~~ sql 
id SERIAL PRIMARY KEY,
quantity integer,
order_id bigint REFERENCES orders(id),
product_id bigint REFERENCES products(id)
~~~~
