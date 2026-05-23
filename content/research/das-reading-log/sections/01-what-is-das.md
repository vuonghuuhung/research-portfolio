---
title: "What is Data Availability Sampling?"
---

The first question I had to settle was simple:

> If a block producer claims that some data exists, how can the rest of the network know that the data is really available without forcing every node to download everything?

In a traditional blockchain, the answer is full replication.
Every full node downloads the whole block, verifies it, and stores enough history to keep the system independently checkable.
That model is clean and secure, but it does not scale well when blocks become large.

For rollups and data-heavy blockchain systems, this becomes a bottleneck.
The data may only be needed for verification during a limited window, but the network still pays the cost of distributing it broadly.
So the goal of Data Availability Sampling is not to make data disappear.
The goal is to make enough of the data checkable so that the network can be confident the full data can be recovered.

## Why simple splitting fails

A naive idea is to split the block into many pieces and let different nodes store different pieces.
At first glance, that seems like sharding:

- each node stores less;
- the whole network collectively stores the block;
- and validators no longer need to download everything.

The problem is that plain splitting is fragile.
If even one important piece disappears, the original block may no longer be reconstructible.
An attacker does not need to hide the whole block.
It may be enough to hide a small part that everyone needs.

![A hidden blob part makes the block unavailable.](/assets/images/das-hans/data-withholding-example.webp)

That is why DAS starts with a stronger primitive: **erasure coding**.

## Erasure coding

Erasure coding changes the availability problem.
Instead of storing only the original pieces, the publisher expands the data into a larger coded form.

The intuition is:

- start with `k` original pieces;
- encode them into `n` coded pieces;
- make the code so that any sufficiently large subset can reconstruct the original data.

So the network no longer depends on every exact original piece staying online.
It only needs enough coded pieces to survive.

![Erasure coding extends raw data so missing pieces can be recovered.](/assets/images/das-hans/erasure-coding-extension.webp)

This is the core shift.
Without erasure coding, the question is:

> Is every original piece still there?

With erasure coding, the question becomes:

> Are enough coded pieces still available to reconstruct the original data?

That second question is what makes sampling possible.

## Sampling instead of full download

Once the data is erasure-coded, a verifier does not need to download the whole encoded block.
It can randomly sample a small number of positions.
If the block producer has hidden enough data to make the block unrecoverable, random samples should hit the missing region with high probability.

For the simple 1D intuition, suppose the data is expanded from `k` pieces into `2k` coded pieces.
To make reconstruction impossible, an attacker must hide more than half of the coded data.
If a verifier samples `n` independent positions, the chance that every sample misses the hidden half is roughly:

`(1/2)^n`

So the detection probability is:

`1 - (1/2)^n`

With only `20` samples, this is already extremely close to `1`.
That is the appeal of DAS:

- the verifier downloads only a tiny part;
- the network still gets strong confidence that the data is available;
- and block size can grow without making every validator download the full block.

## Why the network layer matters

Sampling sounds simple in the abstract, but a real blockchain has to answer a harder question:

> Where does a verifier send a sampling request, and what happens if the peer responsible for that sample is offline or malicious?

This is why DAS is not only about erasure coding or KZG commitments.
Those are necessary, but not enough.
The network must also decide:

- how coded pieces are assigned to peers;
- how samplers discover peers that store the needed data;
- how data is propagated quickly enough before validators attest;
- and how the system remains robust when some peers refuse to serve data.

That is the bridge from the cryptographic idea of DAS to the networking problem that eventually led us to RDA and CDA.
