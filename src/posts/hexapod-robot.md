---
title: 'Hexapod Robot'
date: '2025-11-02'
tags: ['project']
description: 'A six-legged robot with vision-based obstacle avoidance.'
published: true
---

I built a six-legged robot that uses vision to detect and avoid obstacles.

The control loop is straightforward: observe, detect an obstruction, move, then observe again. Executing it means coordinating the legs while accounting for the space the whole robot occupies. Detecting an object ahead is only useful if the resulting movement gives the body and legs enough clearance.

The project focuses on that loop: turning what the camera sees into a movement the robot can carry out.
