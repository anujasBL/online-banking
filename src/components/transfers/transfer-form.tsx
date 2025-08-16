"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowRight, Building, Users } from "lucide-react"
import { z } from "zod"
import {
  internalTransferSchema,
  externalTransferSchema,
  calculateTransferFee,
} from "@/src/lib/validations/transfer"
import { useTransferState } from "@/src/hooks/use-transfers"
import { toast } from "@/src/hooks/use-toast"

interface BankAccount {
  id: string
  accountType: string
  balance: number
  accountNumber: string
}

interface TransferFormProps {
  accounts: BankAccount[]
  onSuccess?: (reference: string) => void
}

type InternalTransferForm = {
  senderAccountId: string
  receiverAccountId: string
  amount: string
  description?: string
}

type ExternalTransferForm = {
  senderAccountId: string
  amount: string
  externalAccountNumber: string
  externalRoutingNumber: string
  externalBankName: string
  description?: string
}

export function TransferForm({ accounts, onSuccess }: TransferFormProps) {
  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal"
  )
  const [externalFee, setExternalFee] = useState(0)
  const { internalTransfer, externalTransfer, isTransferring } =
    useTransferState()

  // Internal transfer form
  const internalForm = useForm<InternalTransferForm>({
    resolver: zodResolver(
      internalTransferSchema.omit({ amount: true }).extend({
        amount: z.string().min(1, "Amount is required"),
      })
    ),
    defaultValues: {
      senderAccountId: "",
      receiverAccountId: "",
      amount: "",
      description: "",
    },
  })

  // External transfer form
  const externalForm = useForm<ExternalTransferForm>({
    resolver: zodResolver(
      externalTransferSchema.omit({ amount: true }).extend({
        amount: z.string().min(1, "Amount is required"),
      })
    ),
    defaultValues: {
      senderAccountId: "",
      amount: "",
      externalAccountNumber: "",
      externalRoutingNumber: "",
      externalBankName: "",
      description: "",
    },
  })

  // Update external fee when amount changes
  const externalAmount = externalForm.watch("amount")
  React.useEffect(() => {
    const amount = parseFloat(externalAmount)
    if (!isNaN(amount) && amount > 0) {
      setExternalFee(calculateTransferFee(amount, true))
    } else {
      setExternalFee(0)
    }
  }, [externalAmount])

  const handleInternalTransfer = async (data: InternalTransferForm) => {
    try {
      const amount = parseFloat(data.amount)

      const result = await internalTransfer.mutateAsync({
        senderAccountId: data.senderAccountId,
        receiverAccountId: data.receiverAccountId,
        amount,
        description: data.description,
      })

      if (result.success) {
        toast({
          title: "Transfer Successful",
          description: `Transfer completed with reference: ${result.reference}`,
        })
        internalForm.reset()
        onSuccess?.(result.reference!)
      }
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleExternalTransfer = async (data: ExternalTransferForm) => {
    try {
      const amount = parseFloat(data.amount)

      const result = await externalTransfer.mutateAsync({
        senderAccountId: data.senderAccountId,
        amount,
        externalAccountNumber: data.externalAccountNumber,
        externalRoutingNumber: data.externalRoutingNumber,
        externalBankName: data.externalBankName,
        description: data.description,
      })

      if (result.success) {
        toast({
          title: "Transfer Initiated",
          description: `External transfer initiated with reference: ${result.reference}`,
        })
        externalForm.reset()
        onSuccess?.(result.reference!)
      }
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const getAccountBalance = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId)
    return account?.balance || 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Transfer Funds
        </CardTitle>
        <CardDescription>
          Send money to other accounts within our system or external banks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "internal" | "external")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Internal Transfer
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              External Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-4">
            <form
              onSubmit={internalForm.handleSubmit(handleInternalTransfer)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender-account">From Account</Label>
                  <Select
                    value={internalForm.watch("senderAccountId")}
                    onValueChange={(value) =>
                      internalForm.setValue("senderAccountId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sender account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountType} - ****
                          {account.accountNumber.slice(-4)}(
                          {formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {internalForm.formState.errors.senderAccountId && (
                    <p className="text-sm text-red-500">
                      {internalForm.formState.errors.senderAccountId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiver-account">To Account</Label>
                  <Select
                    value={internalForm.watch("receiverAccountId")}
                    onValueChange={(value) =>
                      internalForm.setValue("receiverAccountId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select receiver account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(
                          (account) =>
                            account.id !== internalForm.watch("senderAccountId")
                        )
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountType} - ****
                            {account.accountNumber.slice(-4)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {internalForm.formState.errors.receiverAccountId && (
                    <p className="text-sm text-red-500">
                      {internalForm.formState.errors.receiverAccountId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    {...internalForm.register("amount")}
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50000"
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                {internalForm.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {internalForm.formState.errors.amount.message}
                  </p>
                )}
                {internalForm.watch("senderAccountId") && (
                  <p className="text-sm text-gray-500">
                    Available balance:{" "}
                    {formatCurrency(
                      getAccountBalance(internalForm.watch("senderAccountId"))
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  {...internalForm.register("description")}
                  id="description"
                  placeholder="What's this transfer for?"
                  rows={3}
                />
                {internalForm.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {internalForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  Internal transfers are processed immediately and free of
                  charge.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  "Transfer Funds"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            <form
              onSubmit={externalForm.handleSubmit(handleExternalTransfer)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="external-sender-account">From Account</Label>
                <Select
                  value={externalForm.watch("senderAccountId")}
                  onValueChange={(value) =>
                    externalForm.setValue("senderAccountId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sender account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountType} - ****
                        {account.accountNumber.slice(-4)}(
                        {formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {externalForm.formState.errors.senderAccountId && (
                  <p className="text-sm text-red-500">
                    {externalForm.formState.errors.senderAccountId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="external-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      {...externalForm.register("amount")}
                      id="external-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="10000"
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  {externalForm.formState.errors.amount && (
                    <p className="text-sm text-red-500">
                      {externalForm.formState.errors.amount.message}
                    </p>
                  )}
                  {externalForm.watch("senderAccountId") && (
                    <p className="text-sm text-gray-500">
                      Available balance:{" "}
                      {formatCurrency(
                        getAccountBalance(externalForm.watch("senderAccountId"))
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external-bank-name">Bank Name</Label>
                  <Input
                    {...externalForm.register("externalBankName")}
                    id="external-bank-name"
                    placeholder="e.g., Chase Bank"
                  />
                  {externalForm.formState.errors.externalBankName && (
                    <p className="text-sm text-red-500">
                      {externalForm.formState.errors.externalBankName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="external-account-number">
                    Account Number
                  </Label>
                  <Input
                    {...externalForm.register("externalAccountNumber")}
                    id="external-account-number"
                    placeholder="Enter account number"
                  />
                  {externalForm.formState.errors.externalAccountNumber && (
                    <p className="text-sm text-red-500">
                      {
                        externalForm.formState.errors.externalAccountNumber
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external-routing-number">
                    Routing Number
                  </Label>
                  <Input
                    {...externalForm.register("externalRoutingNumber")}
                    id="external-routing-number"
                    placeholder="9-digit routing number"
                    maxLength={9}
                  />
                  {externalForm.formState.errors.externalRoutingNumber && (
                    <p className="text-sm text-red-500">
                      {
                        externalForm.formState.errors.externalRoutingNumber
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="external-description">
                  Description (Optional)
                </Label>
                <Textarea
                  {...externalForm.register("description")}
                  id="external-description"
                  placeholder="What's this transfer for?"
                  rows={3}
                />
                {externalForm.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {externalForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              {externalFee > 0 && (
                <Alert>
                  <AlertDescription>
                    Transfer fee: {formatCurrency(externalFee)} | Total amount:{" "}
                    {formatCurrency(
                      parseFloat(externalAmount || "0") + externalFee
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  External transfers may take 1-2 business days to process. You
                  will receive an email confirmation once initiated.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  "Initiate Transfer"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
