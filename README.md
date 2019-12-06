# jolly-project

## Tables

* user
  * `userId`
  * `username`, unique value, required
  * `name`
  * `password`
  * `image`, link to a picture

* friends
  * `userId`
  * `friendId`

* event  
  * `eventId`
  * `title`
  * `description`
  * `startTime`
  * `endTime`
  * `userId`

* date
  * `dateId`
  * `title`
  * `description`
  * `startTime`
  * `endTime`

* userDate
  * `userId`
  * `dateId`

## Web service

GET to `/` will return a list of URLs for all possible actions.

### Users
* `/users`
  * `GET` returns all users, only if user is logged in
* `/users?search={query}`
  * `GET` returns all users where `{query}` is in a users name or username
* `/users/:id`
  * `GET` returns a user
* `/users/register` 
  * `POST` confirms and creates a user. Returns a token and username ???IS THIS CORRECT????
    * `username`, `password` and `name` must be in body
* `/users/login`
  * `POST` returns a token if data is correct
    * `username` and `password` must be in body
* `/users/me`
  * `GET` returns information about user only if the user is logged in
  * `PATCH` can update password, only if the user is logged in
* `/users/me/image`
  * `PATCH` can update the user's picture, only if the user is logged in
* `/users/me/friends`
  * `GET` returns information about all of user's friends, only if the user is logged in
  * `POST` adds a new friend to a user's friend list, only if the user is logged in
    * `username` must be in body
* `/users/me/friends/:id`
  * `DELETE` removes a friend from a user's friend list, only if the user is logged in

### Event

* `/events/me/event`
  * `POST` adds an event, only if the user is logged in
    * `title`, `description` (optional), `startTime`, `endTime` must be in body
* `/events/me/day`
  * `GET` returns all user's events of one particular day, only if the user is logged in
    * `year`, `month` and `day` must be in body
* `/events/me/week`
  * `GET` returns all user's events of one week, only if user is logged in
    * NOT FINISHED!!!
* `/events/me/month`
  * `GET` returns all user's events of a particular month, only if user is logged in
    * `year` and `month` must be in body
* `/events/me/jolly`
  * `GET` returns all of user's events and chosen friends, between particulart dates, only if user is logged in
    * `startTime`, `endTime` and `ids` must be in body
* `/events/me/event/:id`
  * `GET` returns an event of user's, only if user is logged in
  * `PATCH` updates title, description and dates of a user's event, only if user is logged in
    * `title`, `description`, `starTime` and `endTime` can be in body
  * `DELETE` removes an event, only if user is logged in

### Date

* `/dates/me/date`
  * `POST` adds a date, only if user is logged in
    * `title`, `description` (optional), `startTime`, `endTime`, `ids` must be in body
* `/dates/me/day`
  * `GET` returns all of user's dates for one particular date, only if user is logged in
    * `year`, `month` and `day` must be in body
* `/dates/me/week`
  * `GET` returns all of user's dates within one week, only if user is logged in
    * NOT FINISHED!!!!!
* `/dates/me/month`
  * `GET` returns all of users dates within one month, only if user is logged in
    * `year` and `month` must be in body
* `/dates/me/jolly`
  * `GET` returns all of uers's dates and chosen friends, within two particular dates, only if user is logged in
* `/dates/me/date/:id`
  * `GET` returns a user's date, only if user is logged in
  * `DELETE` removes user's date, only if user is logged in

### VERKEFNI EFTIR!!!
3. Finna út úr viku veseni (GEYMA) fyrir bæði event og date
7. Jolly
8. Þegar þú addar þér sem vin kemur: This is not a username eða eitthvað
