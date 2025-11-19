/**
 * Bid-No-Bid Committee Voting System
 * Democratic decision-making for RFP pursuit
 */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { BidNoBidVote, CommitteeMember, Vote } from '../../types/workflow';
import { ThumbsUp, ThumbsDown, MinusCircle, Users, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/format';

interface BidNoBidVotingProps {
  rfpId: string;
  rfpTitle: string;
  estimatedValue: number;
  committeeMembers: CommitteeMember[];
  onVoteSubmit: (vote: BidNoBidVote) => void;
  existingVote?: BidNoBidVote;
  currentUserId: string;
}

export const BidNoBidVoting: React.FC<BidNoBidVotingProps> = ({
  rfpId,
  rfpTitle,
  estimatedValue,
  committeeMembers,
  onVoteSubmit,
  existingVote,
  currentUserId
}) => {
  const [votes, setVotes] = useState<Vote[]>(existingVote?.votes || []);
  const [myVote, setMyVote] = useState<Partial<Vote> | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);

  const currentMember = committeeMembers.find(m => m.userId === currentUserId);
  const hasVoted = votes.some(v => v.userId === currentUserId);
  const deadline = existingVote?.votingDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const calculateResults = () => {
    let bidVotes = 0;
    let noBidVotes = 0;
    let abstainVotes = 0;
    let totalPower = 0;

    votes.forEach(vote => {
      const member = committeeMembers.find(m => m.userId === vote.userId);
      const power = member?.votingPower || 1;

      if (vote.decision === 'bid') bidVotes += power;
      else if (vote.decision === 'no-bid') noBidVotes += power;
      else abstainVotes += power;

      totalPower += power;
    });

    const requiredVotes = committeeMembers.reduce((sum, m) => sum + (m.required ? m.votingPower : 0), 0);
    const quorumMet = totalPower >= requiredVotes;

    return { bidVotes, noBidVotes, abstainVotes, totalPower, quorumMet };
  };

  const handleSubmitVote = () => {
    if (!myVote?.decision) {
      alert('Please select a vote option');
      return;
    }

    const vote: Vote = {
      userId: currentUserId,
      decision: myVote.decision as 'bid' | 'no-bid' | 'abstain',
      rationale: myVote.rationale,
      votedAt: new Date().toISOString(),
      conditions: myVote.conditions
    };

    const newVotes = [...votes, vote];
    setVotes(newVotes);

    const results = calculateResults();
    const allRequiredVoted = committeeMembers
      .filter(m => m.required)
      .every(m => newVotes.some(v => v.userId === m.userId));

    const votingRecord: BidNoBidVote = {
      id: existingVote?.id || `vote-${Date.now()}`,
      rfpId,
      committeeMembers,
      votes: newVotes,
      decision: allRequiredVoted && results.quorumMet
        ? (results.bidVotes > results.noBidVotes ? 'bid' : 'no-bid')
        : undefined,
      decisionMadeAt: allRequiredVoted && results.quorumMet ? new Date().toISOString() : undefined,
      quorumRequired: committeeMembers.reduce((sum, m) => sum + (m.required ? m.votingPower : 0), 0),
      votingDeadline: deadline,
      status: allRequiredVoted ? 'closed' : 'open'
    };

    onVoteSubmit(votingRecord);
    setShowVoteForm(false);
    setMyVote(null);
  };

  const results = calculateResults();
  const votingComplete = committeeMembers.filter(m => m.required).every(m => votes.some(v => v.userId === m.userId));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <Card variant="elevated">
        <CardBody>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{rfpTitle}</h2>
              <p className="text-gray-600">Estimated Value: ${(estimatedValue / 1000000).toFixed(1)}M</p>
            </div>
            <Badge
              variant={votingComplete ? (results.bidVotes > results.noBidVotes ? 'success' : 'danger') : 'warning'}
              size="lg"
              dot
            >
              {votingComplete
                ? (results.bidVotes > results.noBidVotes ? 'BID APPROVED' : 'NO-BID DECISION')
                : 'VOTING IN PROGRESS'
              }
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Voting Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{results.bidVotes}</p>
              <p className="text-sm text-gray-600">Bid Votes</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold text-red-600">{results.noBidVotes}</p>
              <p className="text-sm text-gray-600">No-Bid Votes</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">{votes.length}/{committeeMembers.length}</p>
              <p className="text-sm text-gray-600">Votes Cast</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">
                {formatDate(deadline, 'short')}
              </p>
              <p className="text-sm text-gray-600">Deadline</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Current User Action */}
      {currentMember && !hasVoted && !votingComplete && (
        <Card variant="elevated">
          <CardHeader title="Your Vote" />
          <CardBody>
            {!showVoteForm ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-700 mb-6">
                  {currentMember.required ? 'Your vote is required' : 'You are invited to vote'}
                </p>
                <Button variant="primary" size="lg" onClick={() => setShowVoteForm(true)}>
                  Cast Your Vote
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vote Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Decision *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMyVote({ ...myVote, decision: 'bid' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        myVote?.decision === 'bid'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <ThumbsUp className={`h-8 w-8 mx-auto mb-2 ${
                        myVote?.decision === 'bid' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <p className="font-medium">Bid</p>
                    </button>

                    <button
                      onClick={() => setMyVote({ ...myVote, decision: 'no-bid' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        myVote?.decision === 'no-bid'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <ThumbsDown className={`h-8 w-8 mx-auto mb-2 ${
                        myVote?.decision === 'no-bid' ? 'text-red-600' : 'text-gray-400'
                      }`} />
                      <p className="font-medium">No-Bid</p>
                    </button>

                    <button
                      onClick={() => setMyVote({ ...myVote, decision: 'abstain' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        myVote?.decision === 'abstain'
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MinusCircle className={`h-8 w-8 mx-auto mb-2 ${
                        myVote?.decision === 'abstain' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className="font-medium">Abstain</p>
                    </button>
                  </div>
                </div>

                {/* Rationale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rationale
                  </label>
                  <textarea
                    value={myVote?.rationale || ''}
                    onChange={(e) => setMyVote({ ...myVote, rationale: e.target.value })}
                    placeholder="Explain your decision..."
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowVoteForm(false);
                      setMyVote(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitVote}
                    disabled={!myVote?.decision}
                  >
                    Submit Vote
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Committee Members & Votes */}
      <Card>
        <CardHeader title="Committee Members" />
        <CardBody>
          <div className="space-y-3">
            {committeeMembers.map(member => {
              const memberVote = votes.find(v => v.userId === member.userId);

              return (
                <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">
                        {member.role} - {member.department}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" variant="default">
                          Voting Power: {member.votingPower}
                        </Badge>
                        {member.required && (
                          <Badge size="sm" variant="warning">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {memberVote ? (
                      <div className="text-right">
                        <Badge
                          variant={
                            memberVote.decision === 'bid' ? 'success' :
                            memberVote.decision === 'no-bid' ? 'danger' : 'default'
                          }
                          size="lg"
                          dot
                        >
                          {memberVote.decision.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(memberVote.votedAt, 'relative')}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="default" size="md">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Vote Details */}
      {votes.length > 0 && (
        <Card>
          <CardHeader title="Vote Details & Rationale" />
          <CardBody>
            <div className="space-y-4">
              {votes.map(vote => {
                const member = committeeMembers.find(m => m.userId === vote.userId);

                return (
                  <div key={vote.userId} className="border-l-4 p-4 rounded" style={{
                    borderColor:
                      vote.decision === 'bid' ? '#10B981' :
                      vote.decision === 'no-bid' ? '#EF4444' : '#9CA3AF'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{member?.name}</p>
                        <p className="text-sm text-gray-600">{member?.role}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            vote.decision === 'bid' ? 'success' :
                            vote.decision === 'no-bid' ? 'danger' : 'default'
                          }
                        >
                          {vote.decision.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(vote.votedAt, 'short')}
                        </p>
                      </div>
                    </div>

                    {vote.rationale && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        "{vote.rationale}"
                      </p>
                    )}

                    {vote.conditions && vote.conditions.length > 0 && (
                      <div className="mt-3 bg-yellow-50 p-3 rounded">
                        <p className="text-sm font-medium text-yellow-900">Conditions:</p>
                        <ul className="list-disc list-inside text-sm text-yellow-800">
                          {vote.conditions.map((condition, idx) => (
                            <li key={idx}>{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Final Decision */}
      {votingComplete && (
        <Card variant="elevated">
          <CardBody>
            <div className="text-center py-6">
              <CheckCircle2 className={`h-16 w-16 mx-auto mb-4 ${
                results.bidVotes > results.noBidVotes ? 'text-green-600' : 'text-red-600'
              }`} />
              <h3 className="text-2xl font-bold mb-2">
                {results.bidVotes > results.noBidVotes ? 'Committee Approves Bid' : 'Committee Declines Bid'}
              </h3>
              <p className="text-gray-600 mb-4">
                Final vote: {results.bidVotes} for Bid, {results.noBidVotes} for No-Bid
              </p>
              <Button
                variant={results.bidVotes > results.noBidVotes ? 'success' : 'danger'}
                size="lg"
              >
                {results.bidVotes > results.noBidVotes ? 'Proceed to Next Stage' : 'Archive RFP'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
