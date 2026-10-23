---
title: 'RL/PPO Drone Simulation Sandbox'
date: '2026-09-16'
tags: ['project']
description: 'Robotomy: a MuJoCo sandbox for PPO training, baseline controllers, and configurable vehicle physics.'
published: true
---

Robotomy is a MuJoCo sandbox I built for training and evaluating vehicle controllers. It supports quadrotors, aquatic vehicles, and ground rovers, with PPO training through Stable-Baselines3.

## Physics and controls

A configuration generates the world and sets actuator response, battery behavior, wind, and water currents. The vehicles share an observation layout: goal error, position, linear velocity, and angular velocity.

Their actions differ. A quadrotor takes collective thrust, roll, pitch, and yaw commands. Its neutral command corresponds to hover trim calculated from mass and gravity. A rover’s neutral command means no drive or yaw.

## Before training

Scripted controllers provide a deterministic baseline. The workflow starts by inspecting the generated world and running that baseline. If the vehicle fails there, the physics, control mapping, and task configuration are the first things to check.

The interactive viewer and headless rollouts use the same simulation stepping code. A run can be watched in the viewer or inspected through trace output.

## Varying a run

Each episode can randomize mass, thrust, drag, motor behavior, sensor noise, wind, and initial state. Training saves policies and a summary; a separate evaluation command reloads a policy for another run.

The sandbox is built for sim-to-real experiments. Transfer to a physical drone still needs testing.
