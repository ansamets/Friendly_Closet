def calculate_elo(winner_rating: float, loser_rating: float, k_factor: int = 32):
    """
    Calculates the new Elo ratings for a winner and a loser.
    """
    # Calculate expected score for the winner
    # Expected_A = 1 / (1 + 10 ^ ((Rating_B - Rating_A) / 400))
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))

    # Calculate new ratings
    # New_Rating = Old_Rating + K * (Actual_Score - Expected_Score)
    # Actual score is 1 for winner, 0 for loser
    new_winner_rating = winner_rating + k_factor * (1 - expected_winner)
    new_loser_rating = loser_rating + k_factor * (0 - (1 - expected_winner))

    return round(new_winner_rating, 2), round(new_loser_rating, 2)
