---
title: 'Hexapod Robot'
date: '2025-11-02'
tags: ['project']
description: 'A six-legged robot combining locomotion and vision-based obstacle detection and avoidance.'
published: true
---

I built a six-legged robot with vision-based navigation for autonomous obstacle detection and avoidance. The project brings together two problems: moving a physical body and using what it sees to decide where that body should go.

That combination is what makes a walking robot interesting. Detecting an obstacle in an image is useful only if the robot can turn that information into movement that clears it. A navigation decision has to account for the body and legs that will actually pass through the space.

## Seeing and moving

At a high level, the task forms a repeated loop: observe the surroundings, identify an obstruction, choose a movement, and observe again. The last step matters because the camera's view changes as the robot moves. A decision based on one view cannot describe the environment indefinitely.

There are two different ways to judge that loop. Perception asks whether an obstacle was detected. Navigation asks whether the resulting motion avoided it. A robot can succeed at the first and still fail at the second—for example, if it detects something ahead but turns without enough clearance for its legs.

The six-legged body adds coordination to that problem. Moving individual joints is only part of locomotion; the movements have to work together to carry the body through a step. The useful unit of behavior is the robot's movement as a whole.

## What avoidance demonstrates

Obstacle avoidance is a specific task with an observable outcome: the robot encounters an obstruction and changes its motion to avoid it. Broader claims about navigation would need broader evidence, such as repeated trials in different environments or a demonstrated ability to reach a destination.

For this project, the focus is the connection between vision and physical action. It is a compact example of why robotics spans software and hardware so closely. The software's decision becomes meaningful when the machine can carry it out in the space around it.
