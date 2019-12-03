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

* `/events/me/event`
  * `POST` bætir við event, aðeins ef notandi er innskráður
* `/events/me/day`
  * `GET` skilar öllum eventum notanda eins ákveðins dags, aðeins ef notandi er innskráður
* `/events/me/week`
  * `GET` skilar öllum eventum notanda einnar ákveðinnar viku, aðeins ef notandi er innskráður
* `/events/me/month`
  * `GET` skilar öllum eventum notanda eins ákveðins mánaðar, aðeins ef notandi er innskráður
* `/events/me/jolly`
  * `GET` skilar öllum eventum notanda og ákveðinna vina, milli ákveðinna tímasetninga, aðeins ef notandi er innskráður
* `/events/me/event/:id`
  * `GET` skilar eventi sem notandi á, aðeins ef notandi er innskráður
  * `PATCH` uppfærir titil, lýsingu og dagsetningu, aðeins ef notandi er innskráður
  * `DELETE` eyðir eventi, aðeins ef notandi er innskráður

### Date

* `/dates/me/date`
  * `POST` bætir við date, aðeins ef notandi er innskráður
* `/dates/me/day`
  * `GET` skilar öllum dateum notanda eins ákveðins dags, aðeins ef notandi er innskráður
* `/dates/me/week`
  * `GET` skilar öllum dateum notanda einnar ákveðinnar viku, aðeins ef notandi er innskráður
* `/dates/me/month`
  * `GET` skilar öllum dateum notanda eins ákveðins mánaðar, aðeins ef notandi er innskráður
* `/dates/me/jolly`
  * `GET` skilar öllum dateum notanda og ákveðinna vina, milli ákveðinna tímasetninga, aðeins ef notandi er innskráður
* `/dates/me/date/:id`
  * `GET` skilar datei sem notandi á, aðeins ef notandi er innskráður
  * `DELETE` eyðir tengingu innskráðs notanda og datei sem notandi á, aðeins ef notandi er innskráður

### VERKEFNI EFTIR!!!
1. Laga 
2. Finna út úr viku veseni
3. Ná í eventa frá mörgum notendum í einu.
4. Ná í date frá mörgum notendum í einu.
5. Sameina 3 og 4??
6. Þýða yfir á ensku og gera betri lýsingar fyrir http-köll
7. Jolly
