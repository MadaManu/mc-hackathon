echo "Adding all files";
git add .;
echo "Commiting files with message: $1";
git commit -m "$1";
echo "Pushing to heroku"; 
git push heroku master
echo "Done! Successfuly pushed to heroku. (heroku-open to open live)";