'use client'

import type { ChallengeType } from '@/challenges/types'
import { RiddlePlayer } from '@/challenges/riddle/Player'
import { WordSearchPlayer } from '@/challenges/wordsearch/Player'
import { QuizPlayer } from '@/challenges/quiz/Player'
import { PhotoVotingPlayer } from '@/challenges/photo_voting/Player'
import { MemoryPlayer } from '@/challenges/memory/Player'
import { WordlePlayer } from '@/challenges/wordle/Player'
import { SnowmanPlayer } from '@/challenges/snowman/Player'
import { ScramblePlayer } from '@/challenges/scramble/Player'
import { EquationPlayer } from '@/challenges/equation/Player'
import { SnowglobesPlayer } from '@/challenges/snowglobes/Player'
import { CatchGiftsPlayer } from '@/challenges/catch_gifts/Player'
import { FindCaganerPlayer } from '@/challenges/find_caganer/Player'
import { BellsMemoryPlayer } from '@/challenges/bells_memory/Player'
import { PicaTioPlayer } from '@/challenges/pica_tio/Player'
import { SudokuPlayer } from '@/challenges/sudoku/Player'

interface ChallengeRendererProps {
  challengeType: ChallengeType | string
  config: Record<string, unknown>
  dayNumber: number
  isAlreadySolved: boolean
  onSuccess: (score?: number, total?: number) => void
}

export function ChallengeRenderer({
  challengeType,
  config,
  dayNumber,
  isAlreadySolved,
  onSuccess,
}: ChallengeRendererProps) {
  switch (challengeType) {
    case 'wordsearch':
      return (
        <WordSearchPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'quiz':
      return (
        <QuizPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'photo_voting':
      return (
        <PhotoVotingPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'memory':
      return (
        <MemoryPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'wordle':
      return (
        <WordlePlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'snowman':
      return (
        <SnowmanPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'scramble':
      return (
        <ScramblePlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'equation':
      return (
        <EquationPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'snowglobes':
      return (
        <SnowglobesPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'catch_gifts':
      return (
        <CatchGiftsPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'find_caganer':
      return (
        <FindCaganerPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'bells_memory':
      return (
        <BellsMemoryPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'pica_tio':
      return (
        <PicaTioPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'sudoku':
      return (
        <SudokuPlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )

    case 'riddle':
    default:
      return (
        <RiddlePlayer
          config={config as any}
          dayNumber={dayNumber}
          isAlreadySolved={isAlreadySolved}
          onSuccess={onSuccess}
        />
      )
  }
}

