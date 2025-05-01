
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PackageFormProps = {
  onSubmit: (packageData: {
    name: string;
    description: string;
    minInvestment: number;
    expectedReturn: number;
    duration: string;
    riskLevel: "low" | "medium" | "high";
  }) => void;
  isLoading: boolean;
};

const PackageForm = ({ onSubmit, isLoading }: PackageFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [duration, setDuration] = useState("");
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      minInvestment: parseFloat(minInvestment),
      expectedReturn: parseFloat(expectedReturn),
      duration,
      riskLevel,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create Investment Package</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Package Name
            </label>
            <Input
              id="name"
              placeholder="Growth Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the investment package"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minInvestment" className="text-sm font-medium">
                Minimum Investment ($)
              </label>
              <Input
                id="minInvestment"
                type="number"
                placeholder="1000"
                value={minInvestment}
                onChange={(e) => setMinInvestment(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="expectedReturn" className="text-sm font-medium">
                Expected Return (%)
              </label>
              <Input
                id="expectedReturn"
                type="number"
                placeholder="12"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration
              </label>
              <Input
                id="duration"
                placeholder="12 months"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="riskLevel" className="text-sm font-medium">
                Risk Level
              </label>
              <Select
                value={riskLevel}
                onValueChange={(value) => setRiskLevel(value as "low" | "medium" | "high")}
              >
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Package"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PackageForm;
