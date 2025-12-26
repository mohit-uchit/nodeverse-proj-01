{ $regex: title, $options: 'i' }

mixs

m - multi line 
i - case insensitive 
s - dot matches newline
x - ingore whitespace


`
 dsfasdf sadfsadfdsaf .
 adsfdasfadsfadsfadsf.
 asdfadsfadsfdsfdsaf
 asdfadsfadsfdsfadsfadsf
 asdfadsdsafadsfasdfasdf
`

date = clg(date)

const date = new Date(date)

clg(date)

Backend 

page = 1
limit = 10


page 2 

kitne skip krne h
page = 2

 limit
1 = 10
2 = 10 ( 20 )

3 = 10 ()

skip = page - 1  * limit



Limit = 10

total records = 36

3.6 = 4

3.4 = 4


Relations

users 

users => orders 
user => address

1. one to many
2. one to one 

user : {
  _id : userId
   name : mohit,
   age : 12
   email : asdfdsf@gmail.com
   adress : {
   userId: ObjectId(user)
   city : new delhi
   state : Delhi
   postalCode : 110001
}
}

adress : {
   userId: ObjectId(user)
   city : new delhi
   state : Delhi
   postalCode : 110001
}