# NoboCRM

HOW TO INSTALL
1. Clone the project
2. Enter the project root directory from the terminal


3. (DEV MODE)ENTER CMD:
  $docker-compose up --build -d 
  (This will run the docker-compose file and create a docker image of the repo and compose all the 
  services together. -d ensures that the service is detatched so that you can continue to use the CLI)

4. PROD MODE ENTER CMD:
  $docker-compose -f docker-compose-deploy.yml up --build -d 
  (This will run the docker-compose-deploy file instead)

5. SETUP DATABASE AND PREPOPULATE: 
   ENTER CMD $docker-compose exec backend python manage.py makemigrations (Create migrations)
   ENTER CMD $docker-compose exec backend python manage.py migrate_schemas (run migrations)
   ENTER CMD $docker-compose exec backend python manage.py bootstrap (prepopulate)


#Useful commands

To enter a container:
docker exec -it [container-id] bash
