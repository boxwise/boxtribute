def query(mysql, sql,options):
    cur = mysql.connection.cursor()
    cur.execute(sql,(options))
    mysql.connection.commit()
    data = cur.fetchall()
    cur.close()
    return data