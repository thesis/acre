import {
  mysteryBoxImage,
  rewardsBoostImage,
  seasonKeyImage,
  bibosBeehiveImage,
} from "#/assets/images/benefits"

type BenefitDetails = {
  name: string
  description: string
  imageSrc: string
}

export const REWARD_BOOST: BenefitDetails = {
  name: "Rewards Boost",
  description: "Boosts your APY when Acre fully launches",
  imageSrc: rewardsBoostImage,
}

export const SEASON_KEY: BenefitDetails = {
  name: "All Seasons Key",
  description: "First dibs access to upcoming seasons",
  imageSrc: seasonKeyImage,
}

export const MYSTERY_BOX: BenefitDetails = {
  name: "Mystery Box",
  description: "A surprise gift for the early birds",
  imageSrc: mysteryBoxImage,
}

export const BIBOS_BEEHIVE: BenefitDetails = {
  name: "Bibo's Beehive",
  description: "Get rewards from top Bitcoin projects",
  imageSrc: bibosBeehiveImage,
}

export const BENEFITS = [SEASON_KEY, BIBOS_BEEHIVE]
