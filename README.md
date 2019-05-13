# jolly-verkefni

## Töflur

* user
  * `userId`
  * `username`, einstakt gildi, krafist
  * `name`
  * `password`
  * `image`, linkur á mynd

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

## Vefþjónustur

GET á `/` skal skila lista af slóðum í mögulegar aðgerðir.

### Notendur
* `/users`
  * `GET` skilar síðu af öllum notendum, aðeins ef notandi er innskráður
* `/users?search={query}`
  * `GET` skilar síðu af notendum þar sem `{query}` er í nafni eða notendanafni
* `/users/:id`
  * `GET` skilar notanda
* `/users/register` 
  * `POST` staðfestir og býr til notanda. Skilar auðkenni og notendanafni
* `/users/login`
  * `POST` með notendanafni og lykilorði skilar token ef gögn eru rétt
* `/users/me`
  * `GET` skilar upplýsingum um notanda aðeins ef notandi er innskráður
  * `PATCH` getur uppfært netfang og lykilorð, aðeins ef notandi er innskráður
* `/users/me/image`
  * `PATCH` breytir mynd notanda, aðeins ef notandi er innskráður
* `/users/me/friends`
  * `GET` skilar upplýsingum um alla vini notanda, aðeins ef notandi er innskráður
  * `POST` bætir nýjum vin á vinalista, aðeins ef notandi er innskráður
* `/users/me/friends/:id`
  * `DELETE` eyðir vin af vinalista notanda ef hann er innskráður

### Event

* `/events`
  * `/GET` skilar öllum eventum notanda, aðeins ef notandi er innskráður
  * `/POST` bætir við event, aðeins ef notandi er innskráður
* `/events/:id`
  * `/GET` skilar eventi sem notandi á, aðeins ef notandi er innskráður
  * `/PATCH` uppfærir titil, lýsingu og dagsetningu, aðeins ef notandi er innskráður
  * `/DELETE` eyðir eventi, aðeins ef notandi er innskráður

### Date

* `/dates`
  * `/GET` skilar öllum dateum notanda, aðeins ef notandi er innskráður
  * `/POST` bætir við date, aðeins ef notandi er innskráður
* `/dates/:id`
  * `/GET` skilar datei sem notandi á, aðeins ef notandi er innskráður
  * `/PATCH` uppfærir titil, lýsingu og dagsetningu, aðeins ef notandi er innskráður



