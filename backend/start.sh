source venv/bin/activate
nohup env APP_ENV=production python3 app.py  &
disown
