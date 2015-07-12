# fightcodegame
This is my robot's code backup for [fightcodegame](http://fightcodegame.com/)

## Game Specifications

### Area Size
#### Training Field
width: 395
height: 480

_origin is top,left._

### Robot Angle
↑: 0
→: 90
↓: 180
←: 270

### Robot Cannon Angle
↑: 90
→: 180
↓: 270
←: 0

_Relative angle is a relative value that is the front of the robot is set to 0 degrees ._

### bearing (property of arguments 'ev' of onWallCollision and onHitByBullet)
bearing is a relative value that is the front of the robot is set to 0 degrees.
This property can vary from -180 to 180 degrees.
Left side of the robot is negative value.
Right side of the robot is positive value.
