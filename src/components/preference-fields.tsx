"use client";

import { Check, CircleDot, Code2, Compass, LaptopMinimal, Settings2, Sparkles, UsersRound, Wrench } from "lucide-react";
import {
  approachOptions,
  experienceOptions,
  interestOptions,
  type AccountPreferenceInput,
  type ApproachId,
  type ExperienceId,
  type InterestId,
} from "@/lib/account-preferences";

const interestIcons = [Settings2, LaptopMinimal, Sparkles, Code2, UsersRound];
const experienceIcons = [Compass, Wrench, Code2];
const approachIcons = [UsersRound, LaptopMinimal, CircleDot];

type PreferenceFieldsProps = {
  value: AccountPreferenceInput;
  onChange: (value: AccountPreferenceInput) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function PreferenceFields({ value, onChange, disabled = false, compact = false }: PreferenceFieldsProps) {
  const toggleInterest = (id: InterestId) => {
    const selected = value.interestCategories.includes(id);
    onChange({
      ...value,
      interestCategories: selected
        ? value.interestCategories.filter((interest) => interest !== id)
        : [...value.interestCategories, id],
    });
  };

  return (
    <div className={compact ? "preference-fields compact" : "preference-fields"}>
      <fieldset className="preference-group">
        <legend>What interests you?</legend>
        <p>Choose any that sound useful. You can change these later.</p>
        <div className="preference-grid interests">
          {interestOptions.map((option, index) => {
            const Icon = interestIcons[index];
            const checked = value.interestCategories.includes(option.id);
            return (
              <label className={checked ? "preference-option selected" : "preference-option"} key={option.id}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleInterest(option.id)} />
                <span className="preference-icon"><Icon aria-hidden="true" size={20} /></span>
                <span className="preference-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
                <span className="preference-check" aria-hidden="true">{checked ? <Check size={15} /> : null}</span>
              </label>
            );
          })}
        </div>
        {value.interestCategories.length > 0 ? (
          <button className="preference-clear" type="button" disabled={disabled} onClick={() => onChange({ ...value, interestCategories: [] })}>Clear interests</button>
        ) : null}
      </fieldset>

      <fieldset className="preference-group">
        <legend>How comfortable are you with digital tools?</legend>
        <p>Pick the closest match, or leave it unanswered.</p>
        <div className="preference-grid thirds">
          {experienceOptions.map((option, index) => {
            const Icon = experienceIcons[index];
            const checked = value.experienceLevel === option.id;
            return (
              <label className={checked ? "preference-option selected" : "preference-option"} key={option.id}>
                <input type="radio" name="experience-level" checked={checked} disabled={disabled} onChange={() => onChange({ ...value, experienceLevel: option.id as ExperienceId })} />
                <span className="preference-icon"><Icon aria-hidden="true" size={20} /></span>
                <span className="preference-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
                <span className="preference-radio" aria-hidden="true" />
              </label>
            );
          })}
        </div>
        {value.experienceLevel ? <button className="preference-clear" type="button" disabled={disabled} onClick={() => onChange({ ...value, experienceLevel: null })}>Clear experience</button> : null}
      </fieldset>

      <fieldset className="preference-group">
        <legend>What would you prefer to offer?</legend>
        <p>This is a discovery preference, not a permanent commitment.</p>
        <div className="preference-grid thirds">
          {approachOptions.map((option, index) => {
            const Icon = approachIcons[index];
            const checked = value.preferredApproach === option.id;
            return (
              <label className={checked ? "preference-option selected" : "preference-option"} key={option.id}>
                <input type="radio" name="preferred-approach" checked={checked} disabled={disabled} onChange={() => onChange({ ...value, preferredApproach: option.id as ApproachId })} />
                <span className="preference-icon"><Icon aria-hidden="true" size={20} /></span>
                <span className="preference-copy"><strong>{option.label}</strong><small>{option.description}</small></span>
                <span className="preference-radio" aria-hidden="true" />
              </label>
            );
          })}
        </div>
        {value.preferredApproach ? <button className="preference-clear" type="button" disabled={disabled} onClick={() => onChange({ ...value, preferredApproach: null })}>Clear approach</button> : null}
      </fieldset>
    </div>
  );
}
