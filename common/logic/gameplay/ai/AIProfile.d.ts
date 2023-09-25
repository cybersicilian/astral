import { Resolver } from "../../structure/utils/Resolver";
export type AIProfile = {
    profile: AIWeights;
    meta: AIMeta;
};
export type AIWeights = {
    collectResource?: Resolver<number>;
    spendResource?: Resolver<number>;
    addCardsToDeck?: Resolver<number>;
    addEvents?: Resolver<number>;
    affectsSelf?: Resolver<number>;
    affectsOpponents?: Resolver<number>;
    changesGame?: Resolver<number>;
    winProgress?: Resolver<number>;
    oppWinSetback?: Resolver<number>;
    meme?: Resolver<number>;
    improvesCard?: Resolver<number>;
    drawsCards?: Resolver<number>;
    drawsOpponentCards?: Resolver<number>;
    discardsCards?: Resolver<number>;
    discardsOpponentCards?: Resolver<number>;
};
export type AIMeta = {
    pgp?: string[];
    pbp?: string[];
};
