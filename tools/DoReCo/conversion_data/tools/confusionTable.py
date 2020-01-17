from ..conversion.Transcription import Transcription, Tier

def writeTable(trans, lt):
    """Writes a contingency table from two tiers."""
    
    cat = []; i_cat = []
        # First round to get the categories
    for a in lt:
        for seg in trans.tiers[a]:
            if seg.content not in cat:
                cat.append(seg.content)
        # Second round to get the counts
    count1 = len(cat)
    for a in range(count1):
        li = []
        for b in range(count1):
            i = 0
            li.append(i)
        i_cat.append(li)
        # Third round to fill the counts
    count2 = len(trans.tiers[lt[0]])
    for a in range(count2):
        cont1 = trans.tiers[lt[0]].segments[a].content
        cont2 = trans.tiers[lt[1]].segments[a].content
        for b in range(count1):
            if cont1 == cat[b]:
                for c in range(count1):
                    if cont2 == cat[c]:
                        i_cat[b][c] += 1
        # Fourth round to add totals
    cat.append("total"); hor = 0; ver = 0; dia = 0
    i_tot = []
    for a in range(count1):
        hor = 0; ver = 0
        for b in range(count1):
            ver += i_cat[b][a]
        i_tot.append(ver)
        dia += ver
        for b in range(len(i_cat[a])):
            hor += i_cat[a][b]
        i_cat[a].append(hor)
    i_tot.append(dia)
    i_cat.append(i_tot)
    return (cat, i_cat)

def confusionTable(trans, lt=[], f="", **args):
    """Writes contingency tables for that transcription.
    
    Assumes that all tiers share the same time boundaries."""
    
        # Variables
    tables = []
    precision = []; recall = []; fmeasure = []; kappa = []; accuracy = []
    names = []
    sep = "\t"
    if "sep" in args:
        sep = args['sep']
        # We get all tables
    if not lt:
        tables = []
        for a in range(len(trans)):
            for b in range(a+1, len(trans)):
                if len(trans.tiers[a]) == len(trans.tiers[b]):
                    tables.append(writeTable(trans, [a, b]))
                    names.append((trans.tiers[a].name, trans.tiers[b].name))
    else:
        for a in range(len(lt)):
            for b in range(a+1,len(lt)):
                if len(trans.tiers[lt[a]]) == len(trans.tiers[lt[b]]):
                    tables.append(writeTable(trans,[lt[a],lt[b]]))
                    names.append((trans.tiers[lt[a]].name, trans.tiers[lt[b]].name))
        # For each table we calculate precision, recall, f-measure and kappa
    for table in tables:
        count1 = len(table[0])-1
        i_kap = 0.; i_exp = 0.; i_prec = 0.; i_rec = 0.; i_fmeas = 0.; i_acc = 0.
        g = table[1][-1][-1]; gi = 0.; pi = 0.; ri = 0.; pd = 0; pr = 0; pg = 0
        acc = 0.
        for a in range(count1):
            gi = table[1][a][a]
            i_kap += gi
            pi = table[1][-1][a]
            if pi > 0:
                i_prec += (gi / pi); pd += 1
            ri = table[1][a][-1]
            if ri > 0:
                i_rec += (gi / ri); pr += 1
            if g > 0:
                i_exp += ((pi*ri) / g); pg += 1
            for b in range(count1):
                acc += table[1][a][b]
        if acc != 0:
            i_acc = (i_kap / acc)
        if pd > 0:
            i_prec = i_prec / pd
        if pr > 0:
            i_rec = i_rec / pr
        if pg > 0:
            i_exp = i_exp / pg
        precision.append(i_prec); recall.append(i_rec)
        if (i_prec+i_rec) != 0:
            i_fmeas = (2*((i_prec*i_rec)/(i_prec+i_rec)))
        else:
            i_fmeas = 0.
        fmeasure.append(i_fmeas)
        if (g-i_exp) == 0:
            i_kap = 1; kappa.append(i_kap)
        else:
            i_kap = ((i_kap-i_exp)/(g-i_exp)); kappa.append(i_kap)
        accuracy.append(i_acc)
        # We write the file
    if not f:
        f = "contingencyTable.txt"
    with open(f, 'w', encoding="utf-8") as file:
        for a in range(len(tables)):
            count2 = len(tables[a][0])
            file.write("Tier0{}Tier1{}Precision{}Recall{}F-measure{}Kappa-score{}Accuracy\n"
                       .format(sep,sep,sep,sep,sep,sep))
            file.write("{}{}{}{}{:.3f}{}{:.3f}{}{:.3f}{}{:.3f}{}{:.3f}\n"
                       .format(names[a][0],sep,names[a][1],sep,precision[a],sep,recall[a],
                       sep,fmeasure[a],sep,kappa[a],sep,accuracy[a]))
            file.write("\n\n\tTable")
            for cat in tables[a][0]:
                file.write("\t" + cat)
            file.write("\n")
            for b in range(count2):
                file.write("\t" + tables[a][0][b])
                for i in tables[a][1][b]:
                    file.write("\t" + str(i))
                file.write("\n")
            file.write("\n\n")
    return 0
