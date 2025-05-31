# pip install Flask Flask-SQLAlchemy
# ngrok config add-authtoken 2YX2qwrfjRDp0tIaltqzrOA6vi3_3peYtLzvvaNWT7GwArt9W
# ngrok http http://localhost:8080

from flask import Flask, render_template, request, redirect, url_for, jsonify, abort, session, send_from_directory
from model import sqlite_service
from datetime import datetime, timedelta


def check_ip(user_ip):
  allow_ip = ['192.168.50.51', '172.24.70.20', '172.31.196.1']
  if True:
    #if user_ip.startswith('192.168.'):
    return True
  else:
    return False


app = Flask(__name__)
user_ip = ''
# sqlite_service.init_stud_score()

score1 = 25
score2 = 60
score3 = 100


# @app.route('/')
@app.route('/quest')
def guide():
  user_ip = request.remote_addr
  pub_url="https://49f6-114-33-104-74.ngrok-free.app/"
  return render_template('index.html', pub_url=pub_url)


@app.route('/score_view/<stud_class>')
def score_view(stud_class):
  score = sqlite_service.score_view(stud_class)
  return render_template('score.html', score=score)


@app.route('/Step_1/<stud_no>',
           methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def Step_1(stud_no):
  stud_name = ''
  user_ip = request.remote_addr
  # if not check_ip(user_ip):
  #   return '{}'.format("請改變你的連線方式")
  if request.method == 'GET':
    stud_no = stud_no.upper()
    check_stud = sqlite_service.check_stud(stud_no)
    if len(check_stud) == 0:
      return '{}'.format("學號可能打錯囉~請再試試")
    else:
      stud_name = check_stud[0]['STUD_NAME']
      now_score = check_stud[0]['SCORE']
      if now_score == score1:
        return '{}請進行下一關，目前期末成績{}分'.format(stud_name, score1)
      elif now_score > score1:
        return '{}請勿重複刷關'.format(stud_name)
      else:
        res = sqlite_service.upd_score(stud_no, score1, user_ip)
        if res:
          return '{}已完成第一關，目前期末成績{}分'.format(stud_name, score1)
  else:
    return '{}'.format("HTTP方法錯囉~請再試試")


@app.route('/Step_2/<stud_no>',
           methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def Step_2(stud_no):
  stud_name = ''
  user_ip = request.remote_addr
  # if not check_ip(user_ip):
  #   return '{}'.format("請改變你的連線方式")
  if request.method == 'POST':
    stud_no = stud_no.upper()
    check_stud = sqlite_service.check_stud(stud_no)
    if len(check_stud) == 0:
      return '{}'.format("學號可能打錯囉~請再試試")
    else:
      stud_name = check_stud[0]['STUD_NAME']
      now_score = check_stud[0]['SCORE']
      if now_score >= score2:
        return f'{stud_name}請進行下一關，目前期末成績{score2}分'
      elif now_score < score1:
        return f'請勿跳關，請先完成上一關'
      else:
        ans = request.form['ans']
        check_ans = sqlite_service.check_ans('2nd', stud_no, ans)
        if check_ans == 1:
          res = sqlite_service.upd_score(stud_no, score2, user_ip)
          if res:
            return '{}已完成第二關，目前期末成績{}分'.format(stud_name, score2)
        else:
          return '答案錯囉，請再試試'
  else:
    return '{}'.format("HTTP方法錯囉~請再試試")


@app.route('/Step_3/<stud_no>',
           methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def Step_3(stud_no):
  stud_name = ''
  user_ip = request.remote_addr
  # if not check_ip(user_ip):
  #   return '{}'.format("請改變你的連線方式")
  if request.method == 'POST':
    stud_no = stud_no.upper()
    check_stud = sqlite_service.check_stud(stud_no)
    if len(check_stud) == 0:
      return '{}'.format("學號可能打錯囉~請再試試")
    else:
      stud_name = check_stud[0]['STUD_NAME']
      now_score = check_stud[0]['SCORE']
      if now_score == score3:
        return '{}打完收工，期末成績{}分'.format(stud_name, score3)
      elif now_score < score2:
        return f'請勿跳關，請先完成上一關'
      else:
        ans = request.form['ans']
        check_ans = sqlite_service.check_ans('3rd', stud_no, ans)
        if check_ans == 1:
          res = sqlite_service.upd_score(stud_no, score3, user_ip)
          if res:
            return '{}打完收工，期末成績{}分'.format(stud_name, score3)
        else:
          return '{}'.format('答案錯囉，請再試試')
  else:
    return '{}'.format("HTTP方法錯囉~請再試試")


@app.route('/<parameter>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def index(parameter):
  user_ip = request.remote_addr
  if request.method == 'GET':
    # 處理 GET 請求的邏輯
    return '這是一個GET的請求，並傳遞參數:{}'.format(parameter)
  elif request.method == 'POST':
    # 處理 POST 請求的邏輯
    return '這是一個POST的請求，並傳遞參數:{}'.format(parameter)
  elif request.method == 'PUT':
    # 處理 PUT 請求的邏輯
    return '這是一個PUT的請求'
  elif request.method == 'DELETE':
    # 處理 DELETE 請求的邏輯
    return '這是一個DELETE的請求'
  elif request.method == 'PATCH':
    # 處理 PATCH 請求的邏輯
    return '這是一個PATCH的請求'
  else:
    return 'Method not allowed'


if __name__ == '__main__':
  app.run(threaded=True)
  app.debug = False
