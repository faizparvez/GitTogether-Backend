=> authRouter
- Post /signup
- Post /login
- Post /logout

=> profileRouter
- Get /profile/view   => get my profile
- Patch /profile/edit => edit my profile details except password and email
- Patch /profile/password => edit the password of my profile


=> The status of the connection req can be : interested, ignored, accepted, rejected 

=> requestRouter
- Post /request/send/interested/:userId
- Post /request/send/ignored/:userId

- Post /request/received/accepted/:reqId
- Post /request/received/rejected/:reqId


=> userRouter
- Get /user/feed => gets you all the profiles of other users present on the platform
- Get /user/connections => gets all the connections 
- Get /user/requests