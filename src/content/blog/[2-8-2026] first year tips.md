---
title: Vex Robotics Tips #1
description: some tips i would give old self
date: 02/8/2026 11:32:34
color: red

page-type: post

styles:
  - /style.css
---


it was my very first year in vex, my team did not qualify for state due to various inconsistencies such as the auton setup and such. If i could compete once more, and fix my mistakes this is what I would do:

1. CAD at least your drivetrain
> my team took apart our drivetrain at least 18 times due to various issues, and if we had cadded the drivetrain, we could have avoided this. make sure to utilize screwjoints and do either 2 or 3 motors on each side. use plastic washers to get low friction, and through cad make sure your spacing is proper as low friction drivetrain while still being 3 gap (thinnest drivetrain possible). 
2. Make sure your drivetrain will have space for your intake idea
> my team built a drivetrain that did not stack motors, or place them vertically, and on one of our first bots this was a hassle.
3. Make sure you attach your odometry wheels first and try to maintain a very low center of gravity
> building everything and then trying to attach your odom wheels is actually hell. if you can make your odom wheels have no offset, but if you do have offset try to perfectly find the offset as it can affect how consistent your auton runs are
4. Try to finish building as early as possible
> my team built until like 3 days before our last competition and this caused us to be very low on time for our autons, which resulted in our auton not being consistent and not qualifying for state
5. Have good build quality
> utilize triangle braces, square everything before you attach your supports, learn about connecting standoffs to shaft collars, get low friction, build light (don't overbuild, make sure that you weigh below 15 pounds if you can). if your robot looks good (good build quality will help your achieve this, you don't need to do aesthetics like coloring your pieces or whatever), it will probably perform better and be more consistent
6. Focus more on consistency rather than overall features
> my team this year tried to jam pack all features and make them all be the best in my org, but we sacrificed time we could have made our intake consistent and not jam
7. Tune your PID properly and accurately
> after you are done building, tune your PID, get it to be have no errors at all, sure getting it perfect may take 3 or 4 hours, but trust me, getting perfect PID is highly recommend by me if you want to have good autons
8. Read Documentation
> try to consult the documentation as much as possible when programming
9. Have a good bot setup on the field for autons
> having a a setup that will have the same pose (same angle and coordinate) will make your consistency so much better
10. Prioritize consistency in autonomous
> go one motion and action at a time, and run that motion at least 10 times to make sure its consistent and then proceed to the next motion and action. make sure you have a proper field and proper setup before this
11. Format your code
> In your code make sure you have comments for each thing, this well help you so much trust me. For each autonomous motion and action, have a comment explaining what each thing does it will help you debug. Setup a github for your code. every single time you something work, commit it. Ensure the main branch is always reliable. create branches for each practice or day. utilize main branch protection to make sure any changes have to go through the process. keep up on git discipline, even though you might be working by yourself, this isn't an excuse to leave your branches a mess and not commit properly/commit directly to main. make sure your commit messages are actually good bro
12. Record every run
> doesn't matter if it is autonomous or driver, it can give you insights if something went wrong and its so useful for consistency and improvement.
13. Don't be a perfectionist
> i was a perfectionist during building, and this led to me having less time for autons and driver practice. although you should build well, don't overbuild and get stuck up on making everything perfect.
14. Checking process for if something goes wrong which was previously working
> 1. Check the code (easiest to make mistakes in and easiest to fix the mistakes)
> 2. Check your wires
> 3. Check your electronics (try testing each device from the devices tab on the brain)
> 4. Check if there is anything stuck within anything causing jams
> 5. Revert your code and try it again
> 6. Figure out whats causing the problem before doing any of the rest of the steps
> 7. Check any easily accessible structure to see if there is anything bent or something you could possibly fix
> 8. Check inner structure
15.  Give your driver practice
16. Bring a highlighter and highlight all of your matches. keep track of time so that you are able to attend matches and fit in skills runs.
17. Try to figure out meta and try to stick to that design, if meta changes and there is a significantly better bot highly consider rebuilding into that if it would be worth it
18. Don't put away rebuilding, it is a part of robotics.
19. Don't rebuild too much
20. Don’t hesitate to talk to other people. If you’re confused about something, ask a referee. If you want to pick around for alliances, you can scout around other teams.
21. Create a new youtube account for robotics and curate it's feed to show you the latest robotics stuff
> watch FUN robotics, watch robot reveals, watch various skills runs, watch finals of various sig events, research into those bots. this youtube account will help you keep up with meta, check once every 2-3 days or daily. 
23. Here are some resources which found very helpful to me:
  * https://lemlib.readthedocs.io/
  * https://github.com/LemLib/LemLib/blob/stable/src/main.cpp
  * https://wiki.purduesigbots.com/
  * https://google.com
  * https://youtube.com/
  * https://www.youtube.com/@FUNRoboticsNetwork/videos
  * https://www.youtube.com/@lukedoesrobotics
  * https://www.youtube.com/@9MotorGang
  * https://pros.cs.purdue.edu/v5/
  * https://www.youtube.com/@2654E
  * https://www.youtube.com/@steamlabstech/videos
  * http://docs.google.com/document/d/1Khb5qvVaI7lqotFUE55bbdhrjMv1lmsBcRYAIv_Lkyk/
  * https://cad.onshape.com/