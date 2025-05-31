import sqlite3, datetime


def init_stud_score():
  conn = sqlite3.connect('sqlite.db')
  conn.row_factory = sqlite3.Row
  cursor = conn.cursor()
  cursor.execute("""SELECT * FROM STUD_SCORE""")
  rows = cursor.fetchall()
  for row in rows:
    stud_no = row['STUD_NO']
    total = 0

    for i in range(int(stud_no[1:3]), int(stud_no[4:7]), int(stud_no[7:])):
      total += i

    try:
      cursor.execute(
        '''UPDATE STUD_SCORE SET a=?, b=?, c=?, d=?,IP=?,score=0,UPD_TIME=? WHERE STUD_NO=?''', (
          int(stud_no[1:3]),
          int(stud_no[4:7]),
          int(stud_no[7:]),
          total,
          None,
          None,
          stud_no,
        ))
      conn.commit()
      res = True
    except sqlite3.IntegrityError as e:
      res = False
      # print("Insertion failed:", e)
    print('{}/{}/{}/{}/{}'.format(stud_no, stud_no[1:3], stud_no[4:7],
                                  stud_no[7:], total))
  conn.close()


def check_stud(stud_no):
  conn = sqlite3.connect('sqlite.db')
  conn.row_factory = sqlite3.Row
  cursor = conn.cursor()
  cursor.execute("""SELECT * FROM STUD_SCORE WHERE UPPER(STUD_NO)=?""",
                 (stud_no, ))
  rows = cursor.fetchall()
  conn.close()
  return rows


def score_view(stud_class):
  conn = sqlite3.connect('sqlite.db')
  conn.row_factory = sqlite3.Row
  cursor = conn.cursor()
  cursor.execute("""SELECT * FROM STUD_SCORE WHERE STUD_CLASS=?""",
                 (stud_class, ))
  rows = cursor.fetchall()
  conn.close()
  return rows


def check_ans(step, stud_no, ans):
  conn = sqlite3.connect('sqlite.db')
  conn.row_factory = sqlite3.Row
  cursor = conn.cursor()
  if step == '2nd':
    cursor.execute(
      """SELECT COUNT(*)CHECK_NUM FROM STUD_SCORE WHERE UPPER(STUD_NO)=? AND b=?""",
      (
        stud_no,
        ans,
      ))
  elif step == '3rd':
    cursor.execute(
      """SELECT COUNT(*)CHECK_NUM FROM STUD_SCORE WHERE UPPER(STUD_NO)=? AND d=?""",
      (
        stud_no,
        ans,
      ))
  rows = cursor.fetchall()
  conn.close()
  return rows[0]['CHECK_NUM']


def upd_score(stud_no, score, user_ip):
  conn = sqlite3.connect('sqlite.db')
  cursor = conn.cursor()
  res = False
  try:
    cursor.execute(
      '''UPDATE STUD_SCORE SET SCORE=?,UPD_TIME=datetime('now', 'localtime', '+8 hours'),IP=? WHERE UPPER(STUD_NO)=?''',
      (
        score,
        user_ip,
        stud_no,
      ))
    conn.commit()
    res = True
  except sqlite3.IntegrityError as e:
    res = False
    # print("Insertion failed:", e)
  finally:
    conn.close()
  return res
