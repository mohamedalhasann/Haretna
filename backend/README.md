Backend Django app for Haretna

Setup (recommended inside a virtualenv):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000/ to view the app.
