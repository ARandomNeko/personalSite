---
title: 'RL/PPO Drone Simulation Sandbox'
date: '2026-09-16'
tags: ['project']
description: 'A MuJoCo sandbox for training and evaluating drone control policies with PPO, with configurable physics for sim-to-real experiments.'
published: true
---

I built a reinforcement-learning drone simulation sandbox for training and evaluating control policies with Proximal Policy Optimization (PPO). The project, Robotomy, uses MuJoCo and includes aerial quadrotors, aquatic vehicles, and ground rovers in a shared simulated world.

The focus is sim-to-real experimentation: making the conditions a controller encounters explicit and adjustable. Training is one part of that workflow. Inspecting the physics, running a baseline controller, and evaluating a saved policy are separate parts that need to work together.

## A shared world with different controls

The sandbox generates a MuJoCo world from configuration. Its vehicle models include actuator response, battery behavior, and environmental effects such as wind and water currents. Each vehicle type has its own control interpretation. For a quadrotor, a neutral command corresponds to hover trim calculated from its mass and gravity; for a rover, it means no drive or yaw command.

The goal-reaching environments use a common observation layout containing goal error, position, linear velocity, and angular velocity. Their actions differ: the aerial policy controls collective thrust, roll, pitch, and yaw, while the aquatic and terrestrial policies use controls suited to their vehicle models.

This makes it possible to work on separate policies while keeping them within the same simulation framework.

## Establishing a baseline

The project includes scripted controllers as well as PPO training through Stable-Baselines3. The documented workflow starts with a deterministic baseline: inspect the generated world, run the scripted controller, and examine the resulting motion before introducing learning.

That order gives debugging a useful starting point. If a vehicle cannot complete a task under the baseline controller, its physics, controls, or task configuration are available to inspect before interpreting a training result.

The interactive viewer and headless rollouts share the same simulation stepping path. A behavior can therefore be examined visually and recorded through trace output without maintaining two different versions of the environment.

## Varying the conditions

The sandbox supports episode-level randomization of properties including mass, thrust, drag, motor behavior, sensor noise, wind, and initial state. Deterministic runs provide a repeatable starting point; randomized runs expose the controller to variations in those configured conditions.

Training produces saved policy files and a summary, and a separate evaluation command can load a policy for another run. These artifacts make it possible to revisit a result and compare behavior across configurations.

The project provides the environment and workflow for these experiments. Transfer to a physical drone remains a separate validation step. For now, the useful result is a sandbox where control policies, their assumptions, and the simulated conditions can be examined together.
