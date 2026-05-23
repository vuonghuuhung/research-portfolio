---
title: "Network Layer for DAS: RDA"
---

After understanding PeerDAS, I realized that DAS has two layers that are easy to mix together.

The first layer is the data layer:

- erasure coding;
- commitments;
- sampling probability;
- proof verification.

The second layer is the network layer:

- where data pieces are stored;
- how peers discover the right holders;
- how fast data is disseminated;
- and how the system behaves when some peers are Byzantine.

Most explanations of DAS emphasize the first layer.
But in a real blockchain, the second layer is just as important.
A sample is only useful if the verifier can actually retrieve it from the network in time.

## Why DHT and gossip are not enough

Distributed Hash Tables are attractive because they give an efficient way to find data in a large peer-to-peer network.
Ethereum already uses peer discovery ideas related to this world.
So it is natural to ask whether DHT-style retrieval can solve DAS sampling.

The problem is adversarial behavior.
DHT retrieval often depends on multi-hop routing and neighborhood structure.
If malicious peers can influence the path or surround a key space region, they can make a sample hard to retrieve even when the data exists somewhere else.

GossipSub has a different tradeoff.
It is useful for spreading messages, but it is not a precise retrieval mechanism.
For very large encoded data, relying only on gossip can create propagation delay and duplicated traffic.

So the network-layer problem is a tradeoff:

- DHT-style retrieval is efficient but fragile under Byzantine routing;
- gossip is robust for broadcast but expensive for large data dissemination;
- centralized builder-heavy approaches can be fast but push responsibility toward a stronger actor.

This is why RDA is interesting.
It gives a cleaner network structure for DAS.

## Robust Distributed Arrays

Robust Distributed Arrays, or `RDA`, organize the peer-to-peer network as a grid.
Each node is assigned to one row and one column.
Instead of knowing the whole network, a node only needs to know peers in its own row and column.

The data is also organized by columns.
A block is divided into chunks, and each chunk is assigned to a network column.
All nodes in that column store the same chunk.

This gives RDA a very simple sampling path:

1. identify which chunk contains the sampled symbol;
2. find the network column responsible for that chunk;
3. ask nodes in that column;
4. as long as one honest node in the column has the chunk, the sample can be served.

That is the power of RDA.
It turns sampling into a mostly one-hop operation and avoids the uncertainty of multi-hop DHT retrieval.

## Why RDA is robust

RDA is pessimistic in a useful way.
It does not need an honest majority in the whole network.
Instead, it needs enough honest nodes distributed so that every important column has at least one honest node.

Once that condition holds, data retrieval is simple.
If a malicious node refuses to answer, the sampler can ask other nodes in the same column.
The grid gives a clear recovery route.

This makes RDA much easier to reason about than a DHT path under adversarial conditions.
The storage location is explicit.
The retrieval path is short.
The security argument is cleaner.

## The cost of RDA

The cost is replication.

Because every node in a column stores the full assigned chunk, the same data is duplicated many times.
If a network has `5000` nodes and the node matrix has `100` columns, then each column has roughly:

`5000 / 100 = 50`

nodes.

That means the chunk assigned to that column is replicated around `50` times.
This is robust, but expensive.

The CDA paper frames this as the key limitation:

> RDA gives an excellent sampling path, but full-column replication is too strong.

That observation became the starting point for our direction.
Instead of discarding RDA's grid structure, we asked a narrower question:

> Can we keep the robust grid idea, but reduce how much duplicate data each column must store and transmit?

For visualization of the RDA direction and the early CDA motivation, the shared slide deck is still useful:
[Open PDF visualization](/assets/files/rda_slide.pdf)
