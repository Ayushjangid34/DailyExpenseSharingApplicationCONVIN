const calculateSplitAmount = (split_method, expenseAmount, participants) => {
  return new Promise((resolve, reject) => {
    const split = [];

    // Split Method: Percentage
    if (split_method === 'percentage') {
      const totalPercentage = participants.reduce(
        (sum, p) => sum + parseFloat(p.split_value),
        0,
      );
      if (totalPercentage !== 100) {
        return reject({ code: 'INVALID_PERCENTAGE_TOTAL' });
      }

      let totalSum = 0;
      participants.forEach(participant => {
        const participantAmount =
          Math.floor(
            expenseAmount * (parseFloat(participant.split_value) / 100) * 1000,
          ) / 1000;
        totalSum += participantAmount;
        split.push({
          participant_id: participant.participant_id,
          amount: participantAmount,
        });
      });

      // Adjusting discrepancy for rounding errors
      let minAmountParticipant = split.reduce(
        (min, current) => (current.amount < min.amount ? current : min),
        split[0],
      );
      minAmountParticipant.amount += expenseAmount - totalSum;
    }

    // Split Method: Equal
    if (split_method === 'equal') {
      if (participants.some(s => 'split_value' in s))
        return reject({ code: 'UNWANTED_SPLIT_VALUE_FOR_EQUAL_METHOD' });
      const numberOfParticipants = participants.length;
      const equalShare =
        Math.floor((expenseAmount / numberOfParticipants) * 1000) / 1000;
      const totalShare = equalShare * numberOfParticipants;

      if (totalShare <= 0) {
        return reject({ code: 'INVALID_EQUAL_SPLIT' });
      }

      participants.forEach(participant => {
        split.push({
          participant_id: participant.participant_id,
          amount: equalShare,
        });
      });

      // Adjusting discrepancy
      let minAmountParticipant = split.reduce(
        (min, current) => (current.amount < min.amount ? current : min),
        split[0],
      );
      minAmountParticipant.amount += expenseAmount - totalShare;
    }

    // Split Method: Exact
    if (split_method === 'exact') {
      let totalExactAmount = 0;
      participants.forEach(participant => {
        const participantAmount = parseFloat(participant.split_value);
        totalExactAmount += participantAmount;
        split.push({
          participant_id: participant.participant_id,
          amount: participantAmount,
        });
      });
      if (totalExactAmount !== expenseAmount) {
        return reject({ code: 'MISMATCH_TOTAL_EXACT_AMOUNT' });
      }
    }
    // Resolving with the calculated split data
    resolve({ participants: split });
  });
};

module.exports = { calculateSplitAmount };
